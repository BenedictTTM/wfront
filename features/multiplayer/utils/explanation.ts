// features/multiplayer/utils/explanation.ts

/**
 * Resolves a concise, rule-based academic concept explanation for a quiz question.
 */
export function getAcademicConceptExplanation(
  questionText?: string,
  serverExplanation?: string,
  roundRevealExplanation?: string
): string {
  if (roundRevealExplanation && roundRevealExplanation.trim().length > 0) {
    return roundRevealExplanation;
  }
  if (serverExplanation && serverExplanation.trim().length > 0) {
    return serverExplanation;
  }

  const text = (questionText || "").toLowerCase();

  // WASSCE / SHS English Grammar & Academic Concept Rules
  if (
    text.includes("kilometer") ||
    text.includes("mile") ||
    text.includes("meter") ||
    text.includes("too far to walk")
  ) {
    return "Grammar Rule: Measurements of distance (e.g., 'ten kilometers') take a singular verb when considered as a single unit or quantity.";
  }
  if (
    text.includes("dollar") ||
    text.includes("cedi") ||
    text.includes("naira") ||
    text.includes("money") ||
    text.includes("too much to spend")
  ) {
    return "Grammar Rule: Sums of money and durations of time function as singular collective units and require a singular verb.";
  }
  if (
    text.includes("each") ||
    text.includes("every") ||
    text.includes("neither") ||
    text.includes("either")
  ) {
    return "Grammar Rule: Singular indefinite pronouns ('each', 'neither', 'either') strictly require singular verbs regardless of intervening plural prepositional phrases.";
  }
  if (
    text.includes("if it rains") ||
    text.includes("conditional") ||
    text.includes("tomorrow, we")
  ) {
    return "Grammar Rule: First conditional structures pair the simple present tense in the 'if' clause with 'will + base verb' in the main clause.";
  }
  if (
    text.includes("mitochondria") ||
    text.includes("cellular") ||
    text.includes("atp")
  ) {
    return "Biology Rule: Mitochondria synthesize the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation during aerobic respiration.";
  }
  if (
    text.includes("farad") ||
    text.includes("capacit") ||
    text.includes("electric")
  ) {
    return "Physics Rule: Capacitance (C = Q/V) is the ratio of stored electric charge to the potential difference across conductors, measured in farads (F).";
  }
  if (
    text.includes("chain rule") ||
    text.includes("ln(") ||
    text.includes("derivative")
  ) {
    return "Calculus Rule: By the logarithmic chain rule, d/dx[ln(u)] = u'/u for any differentiable function u(x).";
  }

  return "Grammar Rule: Concord requires singular verbs for measurements of quantity, distance, or time regarded as an unbroken whole.";
}

/**
 * Resolves a detailed, curriculum-aligned academic deep-dive explanation.
 */
export function getExtendedAcademicExplanation(
  questionText?: string,
  serverExplanation?: string,
  roundRevealExplanation?: string
): string {
  const baseExplanation = roundRevealExplanation || serverExplanation || "";
  const text = (questionText || "").toLowerCase();

  // 1. Biology: Photosynthesis & Plant Pigments
  if (
    text.includes("chlorophyll") ||
    text.includes("pigment") ||
    text.includes("absorbing light") ||
    text.includes("photosynthesis")
  ) {
    return "Curriculum Deep-Dive (Photosynthesis & Pigments):\nChlorophyll pigments (primarily Chlorophyll a and b) are embedded in chloroplast thylakoid membranes to harvest light energy. They absorb light most strongly in the blue-violet (~430 nm) and red (~660 nm) spectral bands while transmitting and reflecting green wavelengths (~500–550 nm). Accessory pigments—such as carotenoids (carotene and xanthophyll) and anthocyanins—broaden the photosynthetically active radiation (PAR) spectrum and protect plant cells from photo-oxidative damage.";
  }

  // 2. Biology: Cell Biology & Mitochondria
  if (
    text.includes("mitochondria") ||
    text.includes("powerhouse") ||
    text.includes("atp") ||
    text.includes("cellular respiration")
  ) {
    return "Curriculum Deep-Dive (Cellular Respiration & Bioenergetics):\nMitochondria are double-membraned eukaryotic organelles responsible for producing the bulk of cellular adenosine triphosphate (ATP). Aerobic cellular respiration occurs across their inner folded cristae and matrix via the Krebs (citric acid) cycle and electron transport chain (oxidative phosphorylation), yielding approximately 30–32 ATP per oxidized glucose molecule.";
  }

  // 3. Biology: Genetics & Chromosomes
  if (
    text.includes("chromosome") ||
    text.includes("diploid") ||
    text.includes("haploid") ||
    text.includes("somatic cell")
  ) {
    return "Curriculum Deep-Dive (Cytology & Chromosomal Genetics):\nHuman somatic (body) cells are diploid (2n = 46), consisting of 23 homologous pairs: 22 pairs of autosomes and 1 pair of sex chromosomes (XX in females, XY in males). Gametes (sperm and ova) formed by meiotic reduction division are haploid (n = 23).";
  }

  // 4. Biology: Circulatory & Heart
  if (
    text.includes("arteries") ||
    text.includes("veins") ||
    text.includes("blood vessel") ||
    text.includes("oxygenated blood")
  ) {
    return "Curriculum Deep-Dive (Cardiovascular Physiology):\nArteries feature thick, muscular, elastic walls and narrow lumina engineered to withstand and propagate high systolic blood pressure generated by ventricular contractions. Pulmonary veins and systemic arteries carry oxygen-rich blood, while veins have wider lumina and semilunar valves preventing low-pressure retrograde flow.";
  }

  // 5. Biology: Respiratory System & Gaseous Exchange
  if (
    text.includes("alveoli") ||
    text.includes("air sacs") ||
    text.includes("gaseous exchange") ||
    text.includes("lungs")
  ) {
    return "Curriculum Deep-Dive (Pulmonary Exchange & Respiration):\nAlveoli are microscopic cup-shaped outpouchings providing a massive surface area (~70–100 m²) encased in pulmonary capillary beds. Their moist, single-cell squamous epithelium facilitates rapid passive diffusion of oxygen into erythrocytes and carbon dioxide into expired air down partial pressure gradients.";
  }

  // 6. English Grammar: Subject-Verb Concord (Measurements of Distance, Money, Time)
  if (
    text.includes("kilometer") ||
    text.includes("mile") ||
    text.includes("meter") ||
    text.includes("too far to walk") ||
    text.includes("dollar") ||
    text.includes("cedi") ||
    text.includes("naira") ||
    text.includes("money") ||
    text.includes("too much to spend")
  ) {
    return "Grammar Deep-Dive (Subject-Verb Concord Rule):\nExpressions of distance, monetary amount, time, and numerical quantities (e.g., 'ten kilometers', 'fifty dollars', 'two hours') represent a single continuous unit or aggregate sum rather than discrete plural components. Consequently, standard formal English requires a singular verb (e.g., 'Ten kilometers IS too far to walk', 'Five hundred dollars WAS allocated').";
  }

  // 7. English Grammar: Indefinite Pronouns
  if (
    text.includes("each") ||
    text.includes("every") ||
    text.includes("neither") ||
    text.includes("either")
  ) {
    return "Grammar Deep-Dive (Indefinite Pronouns Concord):\nDistributive indefinite pronouns ('each', 'either', 'neither', 'everyone', 'everybody') are inherently singular in formal grammar. Intervening plural prepositional phrases (e.g., 'each of the contestants', 'neither of the options') do not govern the predicate verb; the verb must strictly remain singular (e.g., 'Neither of the answers is correct').";
  }

  // 8. English Grammar: Conditionals
  if (
    text.includes("if it rains") ||
    text.includes("conditional") ||
    text.includes("tomorrow, we")
  ) {
    return "Grammar Deep-Dive (Conditional Sentence Structures):\nFirst conditional constructions govern real and probable future conditions. The dependent protasis ('if' clause) utilizes the simple present indicative tense, whereas the independent apodosis (main result clause) requires 'will / shall / can + bare infinitive' (e.g., 'If it rains tomorrow, we will reschedule the match').";
  }

  // 9. Physics: Capacitance & Electric Fields
  if (
    text.includes("farad") ||
    text.includes("capacit") ||
    text.includes("electric")
  ) {
    return "Physics Deep-Dive (Electrostatics & Dielectric Storage):\nCapacitance (C = Q/V) defines the electrical capacity of an isolated conductor or capacitor pair to store electric charge (Q) per unit electric potential difference (V). Measured in Farads (F = C·V⁻¹), practical electronics commonly use microfarads (μF), nanofarads (nF), or picofarads (pF).";
  }

  // 10. Mathematics: Calculus & Derivatives
  if (
    text.includes("chain rule") ||
    text.includes("ln(") ||
    text.includes("derivative")
  ) {
    return "Calculus Deep-Dive (Logarithmic Chain Rule Differentiation):\nFor any composite differentiable function u(x) > 0, the derivative of its natural logarithm follows d/dx[ln(u)] = (1/u) · (du/dx) = u'/u. You compute the derivative of the inner function and divide by the unmanipulated inner argument without squaring the denominator.";
  }

  // 11. English Lexis & Structure: Nearest in Meaning (Synonyms) & Vocabulary
  if (
    text.includes("nearest in meaning") ||
    text.includes("meticulous") ||
    text.includes("opposite in meaning") ||
    text.includes("synonym") ||
    text.includes("antonym")
  ) {
    if (text.includes("meticulous")) {
      return "Curriculum Deep-Dive (Lexis & Vocabulary - Meticulous):\n'Meticulous' originates from the Latin 'meticulosus' and describes extreme, painstaking care and attention to minute details (synonyms: thorough, scrupulous, punctilious, exacting). In the context of an architect's drawings, it denotes rigorous precision and technical thoroughness. Distractors such as 'careless', 'hasty', or 'rushed' represent antonyms.";
    }
    return `Curriculum Deep-Dive (Lexis & Vocabulary):\n${baseExplanation.trim()}\nWASSCE Lexis Rule: When solving 'nearest in meaning' questions, substitute each candidate option back into the original sentence context to ensure semantic tone, register, and grammatical collocations are preserved.`;
  }

  // 12. English Idioms & Figurative Expressions
  if (
    text.includes("idiom") ||
    text.includes("spill the beans") ||
    text.includes("figurative") ||
    text.includes("proverb") ||
    text.includes("metaphor")
  ) {
    if (text.includes("spill the beans")) {
      return "Curriculum Deep-Dive (Idioms & Figurative Language - 'Spill the Beans'):\n'Spill the beans' is an established informal English idiom denoting the inadvertent or premature disclosure of confidential information or secret plans. Figurative idioms cannot be deduced from the literal meanings of their constituent words; instead, they function as non-compositional semantic units. In WASSCE exams, questions testing idioms assess contextual inference—ensuring candidates recognize the figurative connotation (revealing secrets) rather than any literal action.";
    }
    return `Curriculum Deep-Dive (Idiomatic Expressions):\n${baseExplanation.trim()}\nWASSCE Idioms Rule: Figurative expressions rely on fixed semantic conventions. Always examine the situational context to distinguish metaphorical usage from literal distractors.`;
  }

  // Fallback: If base explanation is available, enhance it academically
  if (baseExplanation && baseExplanation.trim().length > 0) {
    return `Curriculum Deep-Dive:\n${baseExplanation.trim()} Focus on understanding the underlying fundamental principle and eliminating distractor options by identifying keyword relationships in the stem.`;
  }

  return "Curriculum Deep-Dive:\nKey Exam Rule: Carefully inspect question qualifiers and verify foundational definitions. Eliminate options that confuse related processes, and ensure grammatical or computational concord with the question stem.";
}
