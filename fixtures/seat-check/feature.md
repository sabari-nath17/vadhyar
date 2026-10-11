# SeatCheck — prepared second-project exercise

This tiny JavaScript project is disclosed prepared demonstration material, unrelated to NovaDesk. It has no database, payment or authentication. Its seed deliberately permits a reservation when zero seats remain. The supplied Node checks are fixture-specific; Project Guide executes a selected npm script, not a universal requirement mapper. A presenter/developer edit is not proof of learner authorship or understanding.

### Requirement: Reserve only an available seat
Allow a reservation only when at least one seat remains.

#### Scenario: Available capacity
With two seats remaining, allow a reservation.

#### Scenario: Full event
With zero seats remaining, deny a reservation.

#### Scenario: Invalid negative capacity
With negative remaining capacity, deny a reservation.
