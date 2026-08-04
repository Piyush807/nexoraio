package io.nexora.backend.ai.dto.request;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    private List<Part> parts;

}