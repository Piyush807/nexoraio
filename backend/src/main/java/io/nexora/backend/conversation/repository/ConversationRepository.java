package io.nexora.backend.conversation.repository;
import io.nexora.backend.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByAccountIdOrderByUpdatedAtDesc(UUID accountId);
    Optional<Conversation> findByIdAndAccountId(UUID id, UUID accountId);
    Optional<Conversation> findTopByGoalIdAndAccountIdOrderByUpdatedAtDesc(UUID goalId, UUID accountId);
}
