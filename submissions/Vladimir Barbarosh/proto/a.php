<?php

// Reference
// ---------
//
// http://stackoverflow.com/questions/6907720/need-to-perform-wildcard-etc-search-on-a-string-using-regex

// abcdef       exact
// foo*         begins with
// *bar         ends with
// *foo*        substr
//
// foo*bar          begins with foo ends with bar
// foo*bar*baz  
// foo*bar*aa*bb*cc*dd*ee*ff*baz  
//
// foo*bar*baz
// foobarbazbarbaz
//
// MATCH SKIP SUBSTR EOF
//
// abcdef       MATCH(abcdef) EOF
// foo*         MATCH(foo)
// *foo         SUBSTR(foo) EOF
// *?foo        SKIP(1) SUBSTR(foo) EOF
// *foo*        SUBSTR(foo)
// foo*bar      MATCH(foo) SUBSTR(bar) EOF
// foo*bar*baz  MATCH(foo) SUBSTR(bar) SUBSTR(baz) EOF
// foo?bar?baz  MATCH(foo) SKIP(1) MATCH(bar) SKIP(1) MATCH(baz) EOF
// foo*?bar     MATCH(foo) SKIP(1) SUBSTR(bar) EOF
// foo*?*bar    MATCH(foo) SKIP(1) SUBSTR(bar) EOF
// foo*?*?bar   MATCH(foo) SKIP(2) SUBSTR(bar) EOF
// foo?bar      MATCH(foo) SKIP(1) MATCH(bar) EOF
// foo*?bar     MATCH(foo) SKIP(1) SUBSTR(bar) EOF
// foo?*bar     MATCH(foo) SKIP(1) SUBSTR(bar) EOF
//
// *  any number of characters (SKIP 0+)
// ?  exactly one character (SKIP 1)
// *? any number of characters followed by exactly one character (SKIP 1+)
// ?* exactly one character followed by any number of characters (SKIP 1+)
// ?*? exactly one characters followed by any number of characters followed by exactly one character (SKIP 2+)
// *?? any number of characters followed by exactly one character followed by exactly one character (SKIP 2+)
//
// any sequence with * and ? can be translate into SKIP N or more
// where N is the number of ? and *more* is present only when *-sign
// is present
//
// MATCH(*) EOF  -> EXACT
// SUBSTR(*) EOF -> LAST

function contains($s, $array)
{
    $offset = 0;
    foreach ($array as $substr) {
        $pos = strpos($s, $substr, $offset);
        if ($pos === false) {
            return false;
        }
        $offset = $pos + strlen($substr);
    }
    return true;
}

class context
{
    public $s;
    public $length;
    public $offset;

    public function __construct($s)
    {
        $this->s = $s;
        $this->length = strlen($s);
        $this->offset = 0;
    }
}

function interpret($s, $vm)
{
    $context = new context($s);

    foreach ($vm as $op) {
        if (!call_user_func($op[0], $context, $op[1])) {
            return false;
        }
    /*
        if (isset($op[1])) {
            $ret = call_user_func($op[0], $context, $op[1]);
        }
        else {
            $ret = call_user_func($op[0], $context);
        }
        if (!$ret) {
            return false;
        }
    */
    }

    return true;
}

function vm_match($context, $s)
{
    if (substr($context->s, $context->offset, strlen($s)) == $s) {
        $context->offset += strlen($s);
        return true;
    }
    return false;
}

function vm_skip($context)
{
    if ($context->offset + 1 >= $context->length) {
        return false;
    }
    $context->offset += 1;
    return true;
}

function vm_substr($context, $s)
{
    $pos = strpos($context->s, $s, $context->offset);
    if ($pos === false) {
        return false;
    }
    $context->offset = $pos + strlen($s);
    return true;
}

function vm_eof($context)
{
    return $context->offset == $context->length;
}

$a = microtime(true);
for ($i = 0; $i < 100000; ++$i) {
    fnmatch('foo*bar*baz', 'foo-bar-baz');
}
echo 'fnmatch: ', number_format(microtime(true) - $a, 2), PHP_EOL;

$a = microtime(true);
for ($i = 0; $i < 100000; ++$i) {
    preg_match('/^foo.*bar.*baz$/', 'foo-bar-baz');
}
echo 'preg_match: ', number_format(microtime(true) - $a, 2), PHP_EOL;

$a = microtime(true);
$tmp = [['vm_match', 'foo'], ['vm_substr', 'bar'], ['vm_substr', 'baz'], ['vm_eof', 0]];
for ($i = 0; $i < 100000; ++$i) {
    interpret('foo-bar-baz', $tmp);
    // substr('foo-bar-baz', -3) == 'baz'; // [['vm_match', 'foo'], ['vm_substr', 'bar'], ['vm_substr', 'baz'], ['vm_eof']]);
}
echo 'interpret: ', number_format(microtime(true) - $a, 2), PHP_EOL;

$a = microtime(true);
for ($i = 0; $i < 100000; ++$i) {
    contains('foo-bar-baz', array('foo', 'bar', 'baz'));
}
echo 'contains: ', number_format(microtime(true) - $a, 2), PHP_EOL;

$a = microtime(true);
for ($i = 0; $i < 100000; ++$i) {
    match('foo*bar*baz', 'foo-bar-baz', 0, 0);
}
echo 'match: ', number_format(microtime(true) - $a, 2), PHP_EOL;

function match($first, $second, $i, $j)
{
    // If we reach at the end of both strings, we are done
    if (strlen($first) >= $i && strlen($second) >= $j)
        return true;

    // Make sure that the characters after '*' are present in second string.
    // This function assumes that the first string will not contain two
    // consecutive '*'
    if ($first[$i] == '*' && strlen($first) >= $i + 1 && strlen($second) == $j)
        return false;

    // If the first string contains '?', or current characters of both
    // strings match
    if ($first[$i] == '?' || $first[$i] == $second[$i])
        return match($first, $second, $i + 1, $j + 1);

    // If there is *, then there are two possibilities
    // a) We consider current character of second string
    // b) We ignore current character of second string.
    if ($first[$i] == '*')
        return match($first, $second, $i + 1, $j) || match($first, $second, $i, $j + 1);

    return false;
}
