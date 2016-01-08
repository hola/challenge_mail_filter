#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "esm/ac_heap.c"
#include "esm/ac_list.c"
#include "esm/aho_corasick.c"


const int TOTAL_MEMORY = (384 - 16) * 1024 * 1024;


int* results_buffer = NULL;
int* results_limit = NULL;
int results_size;


typedef struct { char* from; int from_length; char* to; int to_length; } message_t; // name not used
typedef struct { char* from; char* to; } rule_t; // action not used


message_t* messages;
int messages_count;
rule_t* rules;
int rules_count;


ac_index* index_from = NULL;
ac_index* index_to = NULL;


unsigned int* masks_from = NULL;
unsigned int* masks_to = NULL;


int* query_from = NULL;
int* query_to = NULL;


// void debug_ac_index_enter(char* substring, int length, unsigned int bit) {
//   char save = substring[length];
//   substring[length] = 0;
//   fprintf(stderr, "<%s> length %d bit %d\n", substring, length, bit);
//   substring[length] = save;
// }


int minimal_width = 6;
// int candidates_count = 2;
// int candidates_length = 2;
// int insertions_count = 0;
// int insertions_length = 0;
// int wildcards_count = 0;
// int wildcards_length = 0;


bool process_rule(char* since, ac_index* index, int rule_number, unsigned int* masks) {
  char* pos = since;
  char c = *pos;
  char* start = since;
  int length;
  unsigned int bit = 1;
  while (1) {
    if ((c == '\0') ||
        (c == '*') ||
        (c == '?')) {
      if (pos != start) {
        length = (int) (pos - start);
        // candidates_count++;
        // candidates_length += length;
        // debug_ac_index_enter(start, length, bit);
        if (length > minimal_width) {
          // insertions_count++;
          // insertions_length += length;
          if (!ac_index_enter(index, start, length, rule_number, bit)) {
            return false;
          };
          bit = bit << 1;
          if (bit == 0x40000000) break;
        }
      }
      if (c == '\0') break;
      start = pos + 1;
    }
    pos++;
    c = *pos;
  }
  masks[rule_number] = bit - 1;
  // wildcards_count++;
  // wildcards_length += (int) (pos - since);
  return true;
}


bool process_rules() {

  rule_t* rule = rules;
  int rule_number;

  for (rule_number = 0; rule_number < rules_count; rule_number++) {
    if (rule->from) {
      if (!process_rule(rule->from, index_from, rule_number, masks_from)) {
        return false;
      };
    }
    if (rule->to) {
      if (!process_rule(rule->to, index_to, rule_number, masks_to)) {
        return false;
      };
    }
    rule++;
  }

  return true;

}


// int handy_calls = 0;


bool handy(char* wildcard, char* string) {

  // handy_calls++;
  // fprintf(stderr, "handy %s - %s\n", wildcard, string);

  char *cp = 0;
  char *mp = 0;

  if (!wildcard) {
    return true;
  }

  while ((*string) && (*wildcard != '*')) {
    if ((*wildcard != *string) && (*wildcard != '?')) {
      return false;
    }
    wildcard++;
    string++;
  }

  while (*string) {
    if (*wildcard == '*') {
      if (!*++wildcard) {
        return true;
      }
      mp = wildcard;
      cp = string + 1;
    } else
    if ((*wildcard == *string) || (*wildcard == '?')) {
      wildcard++;
      string++;
    } else {
      wildcard = mp;
      string = cp++;
    }
  }

  while (*wildcard == '*') {
    wildcard++;
  }

  return !*wildcard;

}


bool relation_handy_legacy(message_t* message, rule_t* rule) {
  return (handy(rule->from, message->from) &&
          handy(rule->to, message->to));
}


// int query_successes = 0;


int* process_message(message_t* message, int* results_pos) {

  int rn;

  ac_index_query_KLOPOV5(
    index_from, message->from, message->from_length, query_from
  );

  ac_index_query_KLOPOV5(
    index_to, message->to, message->to_length, query_to
  );

  // fprintf(stderr, "message_from %s, message_to %s\n", message->from, message->to);

  for (rn = 0; rn < rules_count; rn++) {

    // fprintf(stderr, "rule %d, masks_from %d, query_from %d, masks_to %d, query_to %d\n", i, masks_from[i], query_from[i], masks_to[i], query_to[i]);

    if ( ( (masks_from[rn] == 0) || (query_from[rn] == masks_from[rn]) ) &&
         ( (masks_to  [rn] == 0) || (query_to  [rn] == masks_to  [rn]) ) ) {

      if (relation_handy_legacy(message, &rules[rn])) {
        *results_pos = rn;
        results_pos++;
      }

    }

    query_from[rn] = 0;
    query_to[rn] = 0;

  }

  return results_pos;

}


int* process_message_fallback(message_t* message, int* results_pos) {

  int rn;

  for (rn = 0; rn < rules_count; rn++) {

    if (relation_handy_legacy(message, &rules[rn])) {
      *results_pos = rn;
      results_pos++;
    }

  }

  return results_pos;

}


bool process_messages(bool fallback) {

  message_t* message = messages;
  int message_number;
  int* results_pos = results_buffer;
  int* results_pos_header;

  for (message_number = 0; message_number < messages_count; message_number++) {

    results_pos_header = results_pos;
    results_pos++;

    if (fallback) {
      results_pos = process_message_fallback(
        message, results_pos
      );
    } else {
      results_pos = process_message(
        message, results_pos
      );
    }

    *results_pos_header = (
      results_pos - results_pos_header - 1
    );

    if (results_pos > results_limit) {
      return false;
    }

    message++;

  }

  return true;

}


int cleanup() { // must return number

  FREE(results_buffer);
  results_buffer = NULL;

  ac_index_free(index_from);
  index_from = NULL;

  ac_index_free(index_to);
  index_to = NULL;

  FREE(masks_from);
  masks_from = NULL;

  FREE(masks_to);
  masks_to = NULL;

  FREE(query_from);
  query_from = NULL;

  FREE(query_to);
  query_to = NULL;

#ifdef HEAP_CHECK
  acf_give_me_one_more_chance();
#endif

  return 0;

}


void MALLOC_REMAINING(bool emscripten_mode) {

  void* temp = MALLOC(1024);
  if (!temp) return;

  if (emscripten_mode) {
    if (TOTAL_MEMORY < (unsigned long) temp) {
      // fprintf(stderr, "MALLOC_REMAINING lacks %d Mb\n", (int) (((unsigned long) temp - TOTAL_MEMORY) / 1024 / 1024));
      // fprintf(stderr, "MALLOC_REMAINING lacks %d\n", (int) ((unsigned long) temp - TOTAL_MEMORY));
      FREE(temp);
      return;
    }
    results_size = TOTAL_MEMORY - (unsigned long) temp;
    // fprintf(stderr, "MALLOC_REMAINING size %d Mb\n", (int) (results_size / 1024 / 1024));
    // fprintf(stderr, "MALLOC_REMAINING size %d\n", (int) (results_size));
    FREE(temp);
    results_buffer = MALLOC(results_size);
  } else {
    results_size = (256 - 16) * 1024 * 1024;
    FREE(temp); // to pair with emscripten mode
    results_buffer = CALLOC(results_size);
  }

  if (!results_buffer) {
    results_size = 0;
    return;
  }

  results_limit = results_buffer + (
    results_size / sizeof(*results_buffer)
  ) - 2 - rules_count; // maybe results_header_pos or smth

}


void report_fallback(step) {
#ifdef HEAP_CHECK
  fprintf(stderr, "\n***** FALLBACK AT STEP %d *****\n\n", step);
#endif
}


void solve_sub(bool emscripten_mode) {

  bool happy = true;

#ifdef HEAP_CHECK
  acf_setup();
#endif

  if (happy) {
    index_from = ac_index_new();
    happy = index_from;
    if (!happy) report_fallback(0);
  }

  if (happy) {
    index_to = ac_index_new();
    happy = index_to;
    if (!happy) report_fallback(1);
  }

  if (happy) {
    CARRAY(masks_from, rules_count);
    happy = masks_from;
    if (!happy) report_fallback(2);
  }

  if (happy) {
    CARRAY(masks_to, rules_count);
    happy = masks_to;
    if (!happy) report_fallback(3);
  }

  if (happy) {
    happy = process_rules();
    if (!happy) report_fallback(4);
  }

  if (happy) {
    happy = ac_index_fix(index_from);
    if (!happy) report_fallback(5);
  }

  if (happy) {
    happy = ac_index_fix(index_to);
    if (!happy) report_fallback(6);
  }

  if (happy) {
    CARRAY(query_from, rules_count);
    happy = query_from;
    if (!happy) report_fallback(7);
  }

  if (happy) {
    CARRAY(query_to, rules_count);
    happy = query_to;
    if (!happy) report_fallback(8);
  }

  if (happy) {
    MALLOC_REMAINING(emscripten_mode);
    happy = results_buffer;
    if (!happy) report_fallback(9);
  }

  if (happy) {
    happy = process_messages(false);
    if (!happy) report_fallback(10);
  }

  if (happy) {

#ifdef HEAP_CHECK
    fprintf(stderr, "\n--=== no fallback ===--\n\n");
#endif

  } else {

    cleanup();
    MALLOC_REMAINING(emscripten_mode);
    if (!results_buffer) abort(); // must work second time
    process_messages(true);

  }

  // fprintf(stderr, "minimal_width %d\n", minimal_width);
  // fprintf(stderr, "candidates_count %d\n", candidates_count);
  // fprintf(stderr, "candidates_length %d\n", candidates_length);
  // fprintf(stderr, "insertions_count %d\n", insertions_count);
  // fprintf(stderr, "insertions_length %d\n", insertions_length);
  // fprintf(stderr, "wildcards_count %d\n", wildcards_count);
  // fprintf(stderr, "wildcards_length %d\n", wildcards_length);
  // fprintf(stderr, "query_successes %d\n", query_successes);
  // fprintf(stderr, "handy_calls %d\n", handy_calls);

}


int* solve(
  message_t* messages_in, rule_t* rules_in,
  int messages_count_in, int rules_count_in
) {

  void* check_freeing_null = NULL;

  FREE(check_freeing_null);
  if (sizeof(int) != 4) abort();
  if (sizeof(void*) != 4) abort();
  if (sizeof(unsigned int) != 4) abort();
  if (sizeof(unsigned long) != 4) abort();

  messages = messages_in;
  rules = rules_in;
  messages_count = messages_count_in;
  rules_count = rules_count_in;

  solve_sub(true);

  return results_buffer;

}


char* blob_buffer;
int blob_size;


int main(int argc, char const *argv[]) {

  void* check_freeing_null = NULL;
  int messages_size;
  int rules_size;
  int raw_size;
  unsigned long jump;
  int i;

  FREE(check_freeing_null);
  if (sizeof(int) != 4) abort();
  if (sizeof(void*) != 8) abort();
  if (sizeof(unsigned int) != 4) abort();
  if (sizeof(unsigned long) != 8) abort();
  if (sizeof(message_t) != 32) abort();
  if (sizeof(rule_t) != 16) abort();

  fread(&messages_count, sizeof(messages_count), 1, stdin);
  fread(&rules_count, sizeof(rules_count), 1, stdin);
  fread(&raw_size, sizeof(raw_size), 1, stdin);

  messages_size = messages_count * sizeof(message_t);
  rules_size = rules_count * sizeof(rule_t);
  blob_size = messages_size + rules_size + raw_size;
  blob_buffer = malloc(blob_size); // bypass MALLOC to pair with ACF_FAIL_AT in emscripten mode
  fread(blob_buffer, blob_size, 1, stdin);

  messages = (message_t*) blob_buffer;
  rules = (rule_t*) (blob_buffer + messages_size);
  jump = (unsigned long) (blob_buffer);

  for (i = 0; i < messages_count; i++) {
    messages[i].from += jump;
    messages[i].to += jump;
  }

  for (i = 0; i < rules_count; i++) {
    if (rules[i].from) {
      rules[i].from += jump;
    }
    if (rules[i].to) {
      rules[i].to += jump;
    }
  }

  solve_sub(false);

  fwrite(results_buffer, results_size, 1, stdout);
  fflush(stdout);

  cleanup();

  free(blob_buffer); // bypass FREE to pair with ACF_FAIL_AT in emscripten mode

  return 0;

}
