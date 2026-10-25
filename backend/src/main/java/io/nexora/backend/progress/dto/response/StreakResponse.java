package io.nexora.backend.progress.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreakResponse {

    // Consecutive days up to and including today (or yesterday, if nothing
    // has been logged yet today) with at least one progress entry on any
    // goal. Zero if the streak is already broken.
    private int currentStreakDays;

    private int longestStreakDays;

    private LocalDate lastEntryDate;
}
