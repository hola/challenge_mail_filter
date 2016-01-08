module.exports = function( messages, rules )
{
    var msg, i, r, res, mres, mrule;

    res = {}; // Result object

    for( msg in messages ) // Check messages
    {
        if( !messages.hasOwnProperty( msg ) ) // If no message
            continue;

        res[ msg ] = [];

        for( i = 0; i < rules.length; i++ ) // Check rules for message
        {
            r = true; // Default: message correct

            if( rules[ i ].from && rules[ i ].from.length > 0 && r  ) // If from-rule exists
            {
                mres = "no"; // Default result

                mrule = rules[ i ].from.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").replace( /\\\*/g, ".*" ).replace( /\\\?/g, ".?" ); // MAGIC (quote symbols; "*", "?" activating

                mrule = new RegExp( mrule ); // Convert rule string to RegExp

                mres = messages[ msg ].from.replace( mrule, "yes" );

                r = ( mres == "yes" );
            }

            if( rules[ i ].to && rules[ i ].to.length > 0 && r ) // If to-rule exists
            {
                mres = "no"; // Default result

                mrule = rules[ i ].to.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").replace( /\\\*/g, ".*" ).replace( /\\\?/g, ".?" ); // MAGIC (quote symbols; "*", "?" activating

                mrule = new RegExp( mrule ); // Convert rule string to RegExp

                mres = messages[ msg ].to.replace( mrule, "yes" );

                r = ( mres == "yes" );
            }

            if( r ) // If rules are correct or there are no rules
                res[ msg ].push( rules[ i ].action ); // Add action to result object
        }
    }

    return res;
}