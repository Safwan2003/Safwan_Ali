# Research: Med-GReF

**Title:** Med-GReF: Evidence-Guided Multimodal Fusion and Hallucination
Verification for Medical Vision-Language Reasoning.

**Status:** Submitted to NeurIPS 2026 (under anonymous review). Paper PDF is
linked from the portfolio.

## Problem

Vision-language models applied to medical imaging often produce claims that sound
fluent but are not backed by the evidence in front of them — a failure mode with
direct patient-safety consequences.

## Approach

Med-GReF (Medical Grounded Reasoning and Fusion) pairs a frozen vision-language
backbone with:

- Quantitative radiomics features (64-dimensional GLCM texture and first-order
  intensity statistics computed directly from the image).
- Gradient-based visual explanations (Grad-CAM saliency).
- An evidence-guided cross-attention fusion network with dynamic per-sample
  modality gating — the text query attends across vision, radiomics, and saliency
  rather than over a single key.
- A dedicated natural-language-inference (NLI) verifier: a separate,
  independently trainable module that scores whether the model's stated
  conclusion is actually entailed by its own retrieved evidence, producing a
  calibrated confidence.

Backbones are frozen BiomedCLIP (vision + CLIP-based) and PubMedBERT (clinical
text); only small interpretable heads are trained, which keeps local ablation
CPU-feasible. A LoRA/QLoRA-adapted MedGemma-4B generative backbone is fine-tuned
separately on external GPU hardware (RunPod RTX 4090) and folded in as an
additional configuration.

## Data

Built on a corpus of PubMed Central Open Access figures — 27,372 candidate
figures fetched, 13,216 surviving a rule-based integrity, resolution, and
radiological-modality vetting cascade. The corpus is deliberately not treated as
fixed: an audit found data-scarce conditions, and the corpus was expanded over
three rounds to close condition-coverage gaps. Med-GReF is evaluated on twelve
of fifteen women's-health imaging conditions. Data is split by source article
(PMCID), not by row, to avoid a row-level leakage bug found in the source
project's own split.

## Results (held-out, article-grouped test split, mean over 3 seeds)

- Accuracy: 0.817 -> 0.912
- ROC-AUC: 0.570 (near-chance) -> 0.881
- Undetected hallucinations on constructed evidence/conclusion contradiction
  pairs cut roughly 2.4x (16.6% -> 7.0%).
- The verifier catches roughly 6x as many hallucinations as a naive
  confidence-thresholding baseline (65.5% vs 10.3% catch rate).
- The verifier does not improve calibration (Brier and ECE are nominally worse
  than fusion alone) — reported rather than omitted.

## Methodological contribution

Three independent audit passes over the training/evaluation code turned up silent
bugs that would otherwise have produced plausible but meaningless numbers (an
untrained confidence head, an evaluation loop that ignored each model's own
ablation configuration, and a fine-tuning script that would have trained a
generative model on a trivially solvable all-single-class task). Every negative
or inconclusive finding hit while building the system is named in the paper.
Every table and figure value is generated programmatically from the results CSV
rather than typed by hand.
