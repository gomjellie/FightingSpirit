#include <stdio.h>

typedef struct                                                                     {
    int    x                                                                       ;
    int    y                                                                       ;}
Point                                                                              ;

int main()                                                                         {
    Point p = {
        1, 2,
    };

    printf("%d %d\n", p.x, p.y)                                                    ;}
