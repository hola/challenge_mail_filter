#ifndef AC_LIST_H
#define AC_LIST_H

#include <stdbool.h>

typedef struct ac_list_item {
    void*                   item;
    struct ac_list_item*    next;
} ac_list_item;

typedef struct {
    ac_list_item*   first;
    ac_list_item*   last;
} ac_list;

#endif /* AC_LIST_H */
