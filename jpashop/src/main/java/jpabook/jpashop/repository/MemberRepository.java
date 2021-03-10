package jpabook.jpashop.repository;
import jpabook.jpashop.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
@Repository
@RequiredArgsConstructor
public class MemberRepository {

    @PersistenceContext
    private final EntityManager em;

    public void save(Member member) {
        em.persist(member);
    }
    public Member findOne(Long id) {
        return em.find(Member.class, id);
    }
    public List<Member> findAll() { //단건 조회
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }
    public List<Member> findByName(String name) {  //리스트 조회
        return em.createQuery("select m from Member m where m.name = :name",
                Member.class)  //jpql: 객체에 대한 쿼리를 구성함
                .setParameter("name", name)
                .getResultList();
    }
}