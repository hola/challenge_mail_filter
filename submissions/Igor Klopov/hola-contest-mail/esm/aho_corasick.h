#ifndef AHO_CORASICK_H
#define AHO_CORASICK_H

#include "ac_list.h"

typedef char ac_symbol;

#define AC_MIN_SYMBOL 0x20     // Smallest ordinal for an ac_symbol
#define AC_MAX_SYMBOL 0x7F     // Greatest ordinal for an ac_symbol

typedef int ac_offset;

typedef struct ac_index {
    struct ac_state*   state_0;
    ac_list*           disposable;
    ac_list*           queue;
} ac_index;

#endif // AHO_CORASICK_H
