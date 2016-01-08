#include "aho_corasick.h"
#include "ac_heap.h"
#include <stdbool.h>


typedef struct ac_output {
    int           object;
    unsigned int  object2;
} ac_output;


typedef struct ac_state {
    struct ac_state*    gotos[AC_MAX_SYMBOL - AC_MIN_SYMBOL + 1];
    ac_list*            outputs;
    struct ac_state*    failure;
    int                 plains_count;
    ac_output*          plains;
} ac_state;


/* --------------------------------------------------------------------------
 * Goto list
 */


ac_state*
ac_goto_list_get(ac_state* self, ac_symbol symbol) {
    return self->gotos[symbol - AC_MIN_SYMBOL];
}


void
ac_goto_list_add(ac_state* self, ac_symbol symbol, ac_state* state) {
    self->gotos[symbol - AC_MIN_SYMBOL] = state;
}


/* --------------------------------------------------------------------------
 * Output list
 */


void
ac_output_list_free(ac_list* self, bool keep_items) {
    ac_list_free(self, keep_items);
}


bool
ac_output_list_add(ac_list* self, int object, unsigned int object2) {
    ac_output* new_item;

    new_item = MALLOC(sizeof(ac_output));
    if (!new_item) return false;
    new_item->object = object;
    new_item->object2 = object2;

    if (!ac_list_add(self, new_item)) {
        FREE(new_item);
        return false;
    }

    return true;
}


bool
ac_output_list_add_list(ac_list* self, ac_list* other) {
    ac_list_item* list_item = other->first;
    ac_output*    item = NULL;

    while (list_item) {
        item = (ac_output*) list_item->item;
        if (!ac_output_list_add(self, item->object, item->object2)) {
          return false;
        }
        list_item = list_item->next;
    }

    return true;
}


/* --------------------------------------------------------------------------
 * Result list
 */


void
ac_result_list_add_outputs_KLOPOV5(int* objects,
                                   ac_state* state) {
    int count       = state->plains_count;
    ac_output* item = state->plains;
    int i;

    for (i = 0; i < count; i++) {
        objects[item->object] |= item->object2;
        item++;
    }
}


/* --------------------------------------------------------------------------
 * State object
 */


ac_state*
ac_state_new(void) {
    ac_state* self;

    self = CALLOC(sizeof(ac_state));
    if (!self) return NULL;

    self->outputs = ac_list_new();
    if (!self->outputs) {
        FREE(self);
        return NULL;
    }

    // no need to zero fields due to CALLOC

    return self;
}


void
ac_state_free(ac_state* self) {

    ac_output_list_free(self->outputs, false);
    FREE(self->plains);
    FREE(self);
}


/* --------------------------------------------------------------------------
 * Index object
 */


ac_index*
ac_index_new(void) {
    ac_index* self;

    self = MALLOC(sizeof(ac_index));
    if (!self) return NULL;

    self->state_0 = ac_state_new();
    if (!self->state_0) {
        FREE(self);
        return NULL;
    }

    self->disposable = ac_list_new();
    if (!self->disposable) {
        ac_state_free(self->state_0);
        FREE(self);
        return NULL;
    }

    self->queue = ac_list_new();
    if (!self->queue) {
        ac_state_free(self->state_0);
        ac_list_free(self->disposable, true);
        FREE(self);
        return NULL;
    }

    return self;
}


void
ac_index_free(ac_index* self) {
    ac_list*       list = NULL;
    ac_state*      state = NULL;
    ac_list_item*  list_item = NULL;

    if (!self) return;

    ac_state_free(self->state_0);

    list = self->disposable;
    list_item = list->first;

    while (list_item) {
        ac_state_free((ac_state*) list_item->item);
        list_item = list_item->next;
    }

    ac_list_free(list, true);
    ac_list_free(self->queue, true);

    FREE(self);
}


bool
ac_index_enter(ac_index* self,
               ac_symbol* keyword,
               ac_offset size,
               int object,
               unsigned int object2) {
    ac_state* state = self->state_0;
    ac_offset j = 0;
    ac_state* new_state = NULL;

    while ((j < size) &&
           (new_state = ac_goto_list_get(state, keyword[j]))) {
        state = new_state;
        ++j;
    }

    while (j < size) {
        new_state = ac_state_new();
        if (!new_state) return false;
        if (!ac_list_add(self->disposable, new_state)) {
            ac_state_free(new_state);
            return false;
        }
        ac_goto_list_add(state, keyword[j], new_state);
        state = new_state;
        ++j;
    }

    return ac_output_list_add(state->outputs, object, object2);
}


bool
ac_state_linearize(ac_state* self) {
    int           counter;
    ac_list*      outputs;
    ac_list_item* list_item;
    ac_output*    item;
    ac_output*    plains;

    counter = 0;
    outputs = self->outputs;
    list_item = outputs->first;

    while (list_item) {
        counter++;
        list_item = list_item->next;
    }

    self->plains_count = counter;

    if (counter) {

        MARRAY(plains, counter);
        if (!plains) return false;
        self->plains = plains;

        counter = 0;
        outputs = self->outputs;
        list_item = outputs->first;

        while (list_item) {
            item = (ac_output*) (list_item->item);
            plains[counter].object = item->object;
            plains[counter].object2 = item->object2;
            counter++;
            list_item = list_item->next;
        }
    }

    return true;
}


bool
ac_index_fix(ac_index* self) {
    int            symbol;
    ac_state*      state = NULL;
    ac_state*      c = NULL;
    ac_list*       queue = NULL;
    ac_list_item*  queue_item = NULL;
    ac_state*      new_state = NULL;
    ac_state*      next = NULL;

    queue = self->queue;

    for (symbol = AC_MIN_SYMBOL; symbol <= AC_MAX_SYMBOL; symbol++) {
        if ((state = ac_goto_list_get(self->state_0, symbol))) {
            state->failure = self->state_0;
            if (!ac_list_add(queue, state)) {
                return false;
            }
        }
        else {
            ac_goto_list_add(self->state_0, symbol, self->state_0);
        }
    }

    queue_item = queue->first;

    while (queue_item) {
        c = (ac_state*) queue_item->item;

        for (symbol = AC_MIN_SYMBOL; symbol <= AC_MAX_SYMBOL; symbol++) {
            new_state = ac_goto_list_get(c, symbol);

            state = c->failure;
            next = ac_goto_list_get(state, symbol);

            if (new_state) {
                if (!ac_list_add(queue, new_state)) {
                    return false;
                }

                new_state->failure = next;

                if (!ac_output_list_add_list(new_state->outputs, next->outputs)) {
                    return false;
                }
            } else {
                ac_goto_list_add(c, symbol, next);
            }
        }

        if (!ac_state_linearize(c)) {
            return false;
        }

        queue_item = queue_item->next;
    }

    return true;
}


void
ac_index_query_KLOPOV5(ac_index* self,
                       ac_symbol* phrase,
                       ac_offset size,
                       int* objects) {
    ac_state* state = self->state_0;
    ac_offset j = 0;

    for (; j < size; ++j) {
        state = ac_goto_list_get(state, phrase[j]);
        ac_result_list_add_outputs_KLOPOV5(objects, state);
    }
}
