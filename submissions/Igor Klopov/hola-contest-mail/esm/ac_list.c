#include "ac_list.h"
#include "ac_heap.h"


ac_list*
ac_list_new(void) {
    ac_list* self = NULL;

    self = MALLOC(sizeof(ac_list));
    if (!self) return NULL;
    self->first = NULL;
    self->last  = NULL;
    return self;
}


void
ac_list_free(ac_list* self, bool keep_items) {
    ac_list_item* list_item = NULL;
    ac_list_item* temp = NULL;

    if (!self) return;

    list_item = self->first;

    while (list_item) {
        temp = list_item->next;

        if (!keep_items) {
            FREE(list_item->item);
        }

        FREE(list_item);
        list_item = temp;
    }

    FREE(self);
}


bool
ac_list_add(ac_list* self, void* item) {
    ac_list_item* new_list_item;

    new_list_item = MALLOC(sizeof(ac_list_item));
    if (!new_list_item) return false;
    new_list_item->item = item;
    new_list_item->next = NULL;

    if ( ! self->first) {
        self->first = new_list_item;
    }

    if (self->last) {
        self->last->next = new_list_item;
    }

    self->last = new_list_item;
    return true;
}
