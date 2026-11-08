-- Story 5 · finding #59 (defect): explanations follow "with" in "NM means near mint, with …".
update condition_grades set explanation = 'No marks, almost like new' where code = 'NM';
