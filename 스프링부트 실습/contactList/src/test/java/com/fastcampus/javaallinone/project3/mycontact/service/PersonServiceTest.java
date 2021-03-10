package com.fastcampus.javaallinone.project3.mycontact.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastcampus.javaallinone.project3.mycontact.controller.dto.PersonDto;
import com.fastcampus.javaallinone.project3.mycontact.domain.Person;
import com.fastcampus.javaallinone.project3.mycontact.domain.dto.Birthday;
import com.fastcampus.javaallinone.project3.mycontact.exception.PersonNotFoundException;
import com.fastcampus.javaallinone.project3.mycontact.exception.RenameIsNotPermittedException;
import com.fastcampus.javaallinone.project3.mycontact.repository.PersonRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatcher;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * @author Martin
 * @since 2019-08-04
 */
@ExtendWith(MockitoExtension.class)
class PersonServiceTest {
    @InjectMocks
    private PersonService personService;
    @Mock
    private PersonRepository personRepository;

    @Test
    void getAll() {
        when(personRepository.findAll(any(Pageable.class)))
            .thenReturn(new PageImpl<>(Lists.newArrayList(new Person("youjeong"), new Person("jimin"), new Person("jungkook"))));

        Page<Person> result = personService.getAll(PageRequest.of(0, 3));

        assertThat(result.getNumberOfElements()).isEqualTo(3);
        assertThat(result.getContent().get(0).getName()).isEqualTo("youjeong");
        assertThat(result.getContent().get(1).getName()).isEqualTo("jimin");
        assertThat(result.getContent().get(2).getName()).isEqualTo("jungkook");
    }

    @Test
    void getPeopleByName() {
        when(personRepository.findByName("youjeong"))
            .thenReturn(Lists.newArrayList(new Person("youjeong")));

        List<Person> result = personService.getPeopleByName("youjeong");

        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getName()).isEqualTo("youjeong");
    }

    @Test
    void getPerson() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.of(new Person("youjeong")));

        Person person = personService.getPerson(1L);

        assertThat(person.getName()).isEqualTo("youjeong");
    }

    @Test
    void getPersonIfNotFound() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.empty());

        Person person = personService.getPerson(1L);

        assertThat(person).isNull();
    }

    @Test
    void put() {
        personService.put(mockPersonDto());

        verify(personRepository, times(1)).save(argThat(new IsPersonWillBeInserted()));
    }

    @Test
    void modifyIfPersonNotFound() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.empty());

        assertThrows(PersonNotFoundException.class, () -> personService.modify(1L, mockPersonDto()));
    }

    @Test
    void modifyIfNameIsDifferent() {
        when(personRepository.findById((1L)))
            .thenReturn(Optional.of(new Person("jungkook")));

        assertThrows(RenameIsNotPermittedException.class, () -> personService.modify(1L, mockPersonDto()));
    }

    @Test
    void modify() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.of(new Person("youjeong")));

        personService.modify(1L, mockPersonDto());

        verify(personRepository, times(1)).save(argThat(new IsPersonWillBeUpdated()));
    }

    @Test
    void modifyByNameIfPersonNotFound() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.empty());

        assertThrows(PersonNotFoundException.class, () -> personService.modify(1L, "jin"));
    }

    @Test
    void modifyByName() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.of(new Person("youjeong")));

        personService.modify(1L, "jin");

        verify(personRepository, times(1)).save(argThat(new IsNameWillBeUpdated()));
    }

    @Test
    void deleteIfPersonNotFound() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.empty());

        assertThrows(PersonNotFoundException.class, () -> personService.delete(1L));
    }

    @Test
    void delete() {
        when(personRepository.findById(1L))
            .thenReturn(Optional.of(new Person("youjeong")));

        personService.delete(1L);

        verify(personRepository, times(1)).save(argThat(new IsPersonWillBeDeleted()));
    }

    private PersonDto mockPersonDto() {
        return PersonDto.of("youjeong", "programming", "판교", LocalDate.now(), "programmer", "010-1991-0626");
    }

    private static class IsPersonWillBeInserted implements ArgumentMatcher<Person> {
        @Override
        public boolean matches(Person person) {
            return equals(person.getName(), "youjeong")
                && equals(person.getHobby(), "programming")
                && equals(person.getAddress(), "서울")
                && equals(person.getBirthday(), Birthday.of(LocalDate.now()))
                && equals(person.getJob(), "programmer")
                && equals(person.getPhoneNumber(), "010-1991-0626");
        }

        private boolean equals(Object actual, Object expected) {
            return expected.equals(actual);
        }
    }

    private static class IsPersonWillBeUpdated implements ArgumentMatcher<Person> {
        @Override
        public boolean matches(Person person) {
            return equals(person.getName(), "youjeong")
                && equals(person.getHobby(), "programming")
                && equals(person.getAddress(), "서울")
                && equals(person.getBirthday(), Birthday.of(LocalDate.now()))
                && equals(person.getJob(), "programmer")
                && equals(person.getPhoneNumber(), "010-1991-0626");
        }

        private boolean equals(Object actual, Object expected) {
            return expected.equals(actual);
        }
    }

    private static class IsNameWillBeUpdated implements ArgumentMatcher<Person> {
        @Override
        public boolean matches(Person person) {
            return person.getName().equals("jin");
        }
    }

    private static class IsPersonWillBeDeleted implements ArgumentMatcher<Person> {
        @Override
        public boolean matches(Person person) {
            return person.isDeleted();
        }
    }
}