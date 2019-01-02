#include <stdio.h>

struct Man {
    char name[50];
    int age;
};

int main() {
    struct Man james = {
            .name = "james",
            .age = 10,
    };

    printf("%s %d\n", james.name, james.age);
}
