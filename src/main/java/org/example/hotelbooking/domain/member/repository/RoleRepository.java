package org.example.hotelbooking.domain.member.repository;

import org.example.hotelbooking.domain.member.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // 💡 "ROLE_USER", "ROLE_HOST" 같은 이름으로 권한 정보를 찾는 메서드
    Optional<Role> findByRoleName(String roleName);
}