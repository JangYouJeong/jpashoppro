package com.fastcampus.javaallinone.project3.mycontact.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.fastcampus.javaallinone.project3.mycontact.domain.Person;
import com.fastcampus.javaallinone.project3.mycontact.domain.dto.Birthday;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@SpringBootTest
class PersonRepositoryTest {
    @Autowired
    private PersonRepository personRepository;

    @Test
    void findByName() {
        List<Person> people = personRepository.findByName("namjoon");
        assertThat(people.size()).isEqualTo(1);

        Person person = people.get(0);
        assertAll(
            () -> assertThat(person.getName()).isEqualTo("namjoon"),
            () -> assertThat(person.getHobby()).isEqualTo("math"),
            () -> assertThat(person.getAddress()).isEqualTo("일산"),
            () -> assertThat(person.getBirthday()).isEqualTo(Birthday.of(LocalDate.of(1994, 9, 12))),
            () -> assertThat(person.getJob()).isEqualTo("professor"),
            () -> assertThat(person.getPhoneNumber()).isEqualTo("010-1994-0912"),
            () -> assertThat(person.isDeleted()).isEqualTo(false)
        );
    }

    @Test
    void findByNameIfDeleted() {
        List<Person> people = personRepository.findByName("taehyeong");

        assertThat(people.size()).isEqualTo(0);
    }

    @Test
    void findByMonthOfBirthday() {
        List<Person> people = personRepository.findByMonthOfBirthday(7);

        assertThat(people.size()).isEqualTo(2);
        assertAll(
            () -> assertThat(people.get(0).getName()).isEqualTo("jin"),
            () -> assertThat(people.get(1).getName()).isEqualTo("namjoon")
        );
    }

    @Test
    void findPeopleDeleted() {
        List<Person> people = personRepository.findPeopleDeleted();

        assertThat(people.size()).isEqualTo(1);
        assertThat(people.get(0).getName()).isEqualTo("taehyeong");
    }
}