#include <stdio.h>

int main() {
    int cnt = 0 ;
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            printf("%d", cnt++);
        }
    }

    for (int i = 0; i < 10; i++)
    {
        for (int j = 0; j < 10; j++)
        {
            printf("%d", cnt++);
        }
    }

    return 0;
}