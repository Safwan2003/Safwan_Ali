# Selected projects

## AI-Driven Lunar Soil Composition Analysis (Final Year Project — SUPARCO-aligned)

Stack: Python, SAM 2.1, ResNet-18, Gemini 2.0 Flash, Streamlit.
Repo: https://github.com/Safwan2003/AI-Driven-Lunar-Soil-Composition-Analysis-Using-Imagery-and-Large-Language-Models

- End-to-end pipeline analyzing 457 real Chang'e-3 Yutu rover images to estimate
  six lunar mineral oxides (FeO, TiO2, MgO, SiO2, Al2O3, CaO), calibrated to
  Chang'e-3 APXS ground-truth data and aligned with Pakistan's ICUBE-Qamar
  satellite sensor specifications.
- SAM 2.1 for terrain segmentation; a ResNet-18 classifier to identify geological
  units; automated scientific report generation via the Gemini 2.0 Flash LLM.
- Streamlit "Mission Control" dashboard with real-time telemetry and
  physics-based geochemical constraints (oxide-sum conservation).

## Med-GReF — Evidence-Guided Multimodal Fusion and Hallucination Verification for Medical Vision-Language Reasoning

Research paper (NeurIPS 2026 submission, under anonymous review). See research.md
for detail.

- Pairs frozen BiomedCLIP + PubMedBERT backbones with radiomics features, Grad-CAM
  saliency, an evidence-guided cross-attention fusion network, and a dedicated
  natural-language-inference (NLI) verifier that scores whether a model's stated
  conclusion is entailed by its own retrieved evidence.
- On a held-out article-grouped test split, the full configuration lifts accuracy
  from 0.817 to 0.912 and ROC-AUC from near-chance (0.570) to 0.881, and cuts
  undetected hallucinations on constructed contradiction pairs by roughly 2.4x
  (16.6% to 7.0%).

## Voice AI Agents

Repo: https://github.com/Safwan2003/voice (see also
https://github.com/Safwan2003/voice-streaming)

- Real-time streaming voice agents: streaming STT, LLM turn, streaming TTS.
- Low-latency audio streaming, barge-in / interruption handling, multi-turn
  conversational state for automated calls and voice support.

## Busman AI — Leads Scraper

Repo: https://github.com/Safwan2003/ai_leads_scraper_final_server
Stack: Python, FastAPI, Crawl4AI, litellm.

- Multi-agent FastAPI server that writes search queries, scrapes and enriches
  leads with Crawl4AI, and scores buying signals via an LLM.

## Vidra — AI Video Director

Repo: https://github.com/Safwan2003/Vidra-Your-AI-Video-Director

- Agentic pipeline where collaborating agents write, illustrate, animate, and
  narrate marketing videos from a single prompt.

## Heart Disease Prediction — Random Forest Classifier

Repo: https://github.com/Safwan2003/RandomForest_Heart_Disease_Prediction
Stack: Python, scikit-learn, Streamlit.

- Random Forest classifier for clinical heart-disease risk prediction with feature
  selection, preprocessing, and hyperparameter tuning. Deployed as a Streamlit
  application serving real-time inference.

## Fruit Classification CNN

Repo: https://github.com/Safwan2003/FruitClassification_CNN
Stack: Python, TensorFlow, Keras.

- CNN with data augmentation and batch normalization for multi-class fruit image
  classification; transfer learning and hyperparameter tuning.

## Additional ML / Data Science work

- SVM Handwritten Digit Classifier (MNIST) with HOG feature extraction —
  https://github.com/Safwan2003/SVM-Handwritten-Digit-Classifier
- Customer Segmentation with K-Means clustering —
  https://github.com/Safwan2003/customer-segmentation-kmeans-clustering
- Linear Regression sales-forecasting model —
  https://github.com/Safwan2003/LinearRegression
- Urdu TTS — https://github.com/Safwan2003/Urdu-TTS
- Roughly 30 public repositories in total: https://github.com/Safwan2003
