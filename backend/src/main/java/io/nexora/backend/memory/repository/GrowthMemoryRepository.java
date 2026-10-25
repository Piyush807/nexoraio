package io.nexora.backend.memory.repository;

import io.nexora.backend.memory.entity.GrowthMemory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GrowthMemoryRepository extends JpaRepository<GrowthMemory, UUID> {
    Optional<GrowthMemory> findByAccountId(UUID accountId);
}
