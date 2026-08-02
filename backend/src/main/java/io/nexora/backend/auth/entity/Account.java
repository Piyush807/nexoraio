package io.nexora.backend.auth.entity;

import io.nexora.backend.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Account {


    @Id
    @GeneratedValue
    private UUID id;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Builder.Default
    private boolean enabled = true;

}
