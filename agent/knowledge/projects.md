# Selected projects

## AI-Driven Lunar Soil Composition Analysis (Final Year Project)

Stack: Python, SAM 2.1, ResNet-18, Gemini 2.0 Flash, Streamlit.
Repo: https://github.com/Safwan2003/AI-Driven-Lunar-Soil-Composition-Analysis-Using-Imagery-and-Large-Language-Models

This is Safwan's own final-year project. There was early contact with SUPARCO that
did not lead to a formal collaboration; the work is self-directed and built
around publicly documented ICUBE-Qamar specs. Do not describe it as a SUPARCO
project or claim SUPARCO endorsement.

- End-to-end pipeline analyzing 457 real Chang'e-3 Yutu rover images to estimate
  six lunar mineral oxides (FeO, TiO2, MgO, SiO2, Al2O3, CaO), calibrated to
  Chang'e-3 APXS ground-truth data and built around the published sensor
  specifications of Pakistan's ICUBE-Qamar lunar mission.
- SAM 2.1 for terrain segmentation; a ResNet-18 classifier to identify geological
  units; automated scientific report generation via the Gemini 2.0 Flash LLM.
- Streamlit "Mission Control" dashboard with real-time telemetry and
  physics-based geochemical constraints (oxide-sum conservation).

## Med-GReF — Evidence-Guided Multimodal Fusion and Hallucination Verification for Medical Vision-Language Reasoning

An in-progress research project by Safwan. A working paper has been drafted in
NeurIPS format but has NOT been submitted or published. Describe it as a working
paper / research in progress, never as "submitted to NeurIPS" or "published". See
research.md for detail.

- Pairs frozen BiomedCLIP + PubMedBERT backbones with radiomics features, Grad-CAM
  saliency, an evidence-guided cross-attention fusion network, and a dedicated
  natural-language-inference (NLI) verifier that scores whether a model's stated
  conclusion is entailed by its own retrieved evidence.
- Draft results, on a held-out article-grouped test split: the full configuration
  lifts accuracy from 0.817 to 0.912 and ROC-AUC from near-chance (0.570) to
  0.881, and cuts undetected hallucinations on constructed contradiction pairs by
  roughly 2.4x (16.6% to 7.0%). These are unpublished in-progress numbers.

## Production AI at MarkyTech (employer work — not open source)

The following were built and deployed by Safwan inside MarkyTech's commercial
products. He wrote and owns the implementation knowledge, but the code is the
company's and is not publicly linkable.

- **Real-time voice AI agents** — streaming STT, LLM turn, streaming TTS;
  low-latency audio, barge-in / interruption handling, multi-turn conversational
  state for automated calls and voice support.
- **Busman AI lead-generation system** — a multi-agent FastAPI service that
  writes search queries, scrapes and enriches leads with Crawl4AI, and scores
  buying signals via an LLM. Safwan built this lead-generation component.
- **Generative media tooling** — hyper-realistic image/video generation engines
  served on GPU infrastructure (RunPod).
- LLM chatbots and RAG pipelines for clients (OpenAI, Gemini, Claude; LangChain).
- Multi-agent business-process automation with AutoGen and AgentScope.

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
