package jpabook.jpashop.domain;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.criterion.Order;

import javax.persistence.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

import static javax.persistence.FetchType.LAZY;

@SuppressWarnings("JpaAttributeTypeInspection")
@Entity
@Getter @Setter
public class Member {

    @Id @GeneratedValue
    @Column(name = "member_id")
    private Long id;

    private String name;


    @Embedded
    private Address address;

    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();


}
