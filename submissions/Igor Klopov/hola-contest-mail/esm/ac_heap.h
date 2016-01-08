#include <stdlib.h>

// #define HEAP_CHECK

#ifdef HEAP_CHECK

#define MALLOC(s)    (ac_malloc(s, __FILE__, __LINE__))
#define MARRAY(a, s) (a = ac_malloc(s * sizeof(*a), __FILE__, __LINE__))
#define CALLOC(s)    (ac_calloc(s, 1, __FILE__, __LINE__))
#define CARRAY(a, s) (a = ac_calloc(s, sizeof(*a), __FILE__, __LINE__))
#define FREE(p)      (ac_free(p, __FILE__, __LINE__))

void acf_give_me_one_more_chance();

#else

#define MALLOC(s)    (malloc(s))
#define MARRAY(a, s) (a = malloc(s * sizeof(*a)))
#define CALLOC(s)    (calloc(s, 1))
#define CARRAY(a, s) (a = calloc(s, sizeof(*a)))
#define FREE(s)      (free(s))

#endif
