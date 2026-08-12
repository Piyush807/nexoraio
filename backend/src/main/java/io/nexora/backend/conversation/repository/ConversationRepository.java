package io.nexora.backend.conversation.repository;

import io.nexora.backend.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByAccountId(UUID accountId);
    Optional<Conversation> findByIdAndAccountId(UUID conversationId, UUID accountId);
    Optional<Conversation> findTopByGoalIdAndAccountIdOrderByUpdatedAtDesc(UUID goalId, UUID accountId);
}
