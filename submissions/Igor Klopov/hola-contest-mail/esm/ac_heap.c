#include "ac_heap.h"
#include <stdio.h>


#ifdef HEAP_CHECK


static int acf_fail_at = -1;
static int acf_counter = 0;


void* acf_malloc(size_t size) {
    if (acf_fail_at == -1) {
        abort();
    } else
    if (acf_counter < acf_fail_at) {
        acf_counter++;
        return malloc(size);
    } else {
        return NULL;
    }
}


void* acf_calloc(size_t count, size_t size) {
    if (acf_fail_at == -1) {
        abort();
    } else
    if (acf_counter < acf_fail_at) {
        acf_counter++;
        return calloc(count, size);
    } else {
        return NULL;
    }
}


void acf_free(void* p) {
    free(p);
}


static char* acf_fail_at_env = "ACF_FAIL_AT";


void acf_setup() {
    char* env = getenv(acf_fail_at_env);
    int value = 0;
    if (!env) {
        fprintf(stderr, "%s env var not found\n", acf_fail_at_env);
        return;
    }
    while (*env) {
        value = value * 10 + (*env - 48);
        env++;
    }
    fprintf(stderr, "%s=%d\n", acf_fail_at_env, value);
    acf_fail_at = value;
}


void acf_give_me_one_more_chance() {
    if (acf_counter > acf_fail_at - 2) { // MALLOC(temp) + MALLOC(remaining)
        acf_counter = acf_fail_at - 2;
    }
}


static size_t ac_total = 0;


void* ac_malloc(size_t size, char* file, int line) {
    void* result = acf_malloc(size);

    if (result) {
        fprintf(stderr, "malloc %p at %s:%d\n", result, file, line);
        ac_total += size;
    } else {
        fprintf(stderr, "malloc NULL at %s:%d\n", file, line);
    }
    fprintf(stderr, "t %d\n", (int) ac_total);
    return result;
}


void* ac_calloc(size_t count, size_t size, char* file, int line) {
    void* result = acf_calloc(count, size);

    if (result) {
        fprintf(stderr, "calloc %p at %s:%d\n", result, file, line);
        ac_total += (count * size);
    } else {
        fprintf(stderr, "calloc NULL at %s:%d\n", file, line);
    }
    fprintf(stderr, "t %d\n", (int) ac_total);
    return result;
}


void ac_free(void* p, char* file, int line) {
    fprintf(stderr, "free %p at %s:%d\n", p, file, line);
    acf_free(p);
}


#endif
