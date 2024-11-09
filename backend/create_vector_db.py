from openai import OpenAI
import langchain
import pinecone
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone as PineconeClient, ServerlessSpec
from keys import OPENAI_KEY, PINECONE_KEY, PINECONE_URL

symptom_data = [
    {"index": "fever_index", "symptom": "Fever", "description": "Often associated with infections such as Influenza, Pneumonia, COVID-19, Malaria, and Urinary Tract Infections (UTIs). Fever can also indicate autoimmune diseases like Rheumatoid Arthritis or Lupus."},
    {"index": "cough_index", "symptom": "Cough", "description": "Commonly seen in conditions like Common Cold, Bronchitis, Asthma, Chronic Obstructive Pulmonary Disease (COPD), Lung Cancer, and Gastroesophageal Reflux Disease (GERD). A cough with mucus may indicate pneumonia or tuberculosis."},
    {"index": "headache_index", "symptom": "Headache", "description": "Linked to a variety of conditions such as Migraines, Tension Headaches, Sinus Infections, Cluster Headaches, High Blood Pressure, and can even signal a brain tumor in severe cases."},
    {"index": "fatigue_index", "symptom": "Fatigue", "description": "A common symptom in Anemia, Hypothyroidism, Chronic Fatigue Syndrome, Depression, Heart Disease, and Sleep Apnea. Fatigue can also result from diabetes or chronic infections."},
    {"index": "shortness_of_breath_index", "symptom": "Shortness of Breath", "description": "Frequently associated with Asthma, COPD, Heart Failure, Pneumonia, Pulmonary Embolism, and COVID-19. In some cases, it may be due to anxiety disorders or obesity."},
    {"index": "chest_pain_index", "symptom": "Chest Pain", "description": "May indicate Heart Attack, Angina, Pneumonia, Pericarditis, or Pulmonary Embolism. In less severe cases, chest pain can arise from Gastroesophageal Reflux Disease (GERD) or muscle strain."},
    {"index": "abdominal_pain_index", "symptom": "Abdominal Pain", "description": "Common in Gastritis, Appendicitis, Irritable Bowel Syndrome (IBS), Gallstones, Pancreatitis, Peptic Ulcers, and Kidney Stones. Lower abdominal pain can also indicate urinary tract infections or ovarian cysts."},
    {"index": "joint_pain_index", "symptom": "Joint Pain", "description": "A prominent symptom in Rheumatoid Arthritis, Osteoarthritis, Gout, Lupus, and Lyme Disease. Joint pain can also occur with fibromyalgia and psoriatic arthritis."},
    {"index": "skin_rash_index", "symptom": "Skin Rash", "description": "Common in Allergic Reactions, Eczema, Psoriasis, Lupus, Chickenpox, Measles, and Ringworm. A rash can also be a reaction to medications or environmental triggers."},
    {"index": "nausea_and_vomiting_index", "symptom": "Nausea and Vomiting", "description": "Often associated with Gastroenteritis, Pregnancy (morning sickness), Migraine, Food Poisoning, Motion Sickness, Pancreatitis, and Appendicitis. It can also be a side effect of medications or a symptom of liver disease."},
    {"index": "dizziness_index", "symptom": "Dizziness", "description": "Seen in Vertigo, Low Blood Pressure, Dehydration, Anemia, Hypoglycemia, and Meniere’s Disease. Dizziness can also result from inner ear infections or anxiety."},
    {"index": "weight_loss_index", "symptom": "Weight Loss", "description": "Unintentional weight loss can be associated with Diabetes, Hyperthyroidism, Cancer, Celiac Disease, Chronic Obstructive Pulmonary Disease (COPD), Heart Failure, and Tuberculosis."},
    {"index": "night_sweats_index", "symptom": "Night Sweats", "description": "Commonly found in Infections (like Tuberculosis and HIV), Lymphoma, Leukemia, Menopause, and Hyperthyroidism. Night sweats can also occur with anxiety or due to medications."},
    {"index": "swollen_lymph_nodes_index", "symptom": "Swollen Lymph Nodes", "description": "Often seen in Infections (e.g., Strep Throat, Mononucleosis, HIV, Tuberculosis), Lymphoma, Leukemia, and Systemic Lupus Erythematosus."},
    {"index": "painful_urination_index", "symptom": "Painful Urination", "description": "Commonly indicates Urinary Tract Infections (UTIs), Bladder Infections, Kidney Stones, Prostatitis (in men), or Sexually Transmitted Infections (STIs) such as Chlamydia and Gonorrhea."},
    {"index": "back_pain_index", "symptom": "Back Pain", "description": "Frequently associated with Herniated Discs, Sciatica, Kidney Stones, Osteoarthritis, Spondylitis, and Muscle Strain. Chronic back pain may indicate spinal stenosis or fibromyalgia."},
    {"index": "blurred_vision_index", "symptom": "Blurred Vision", "description": "Can be a sign of Diabetes (diabetic retinopathy), Glaucoma, Cataracts, Stroke, Multiple Sclerosis (MS), or Eye Infections. Short-term blurred vision may result from migraine aura."},
    {"index": "memory_loss_index", "symptom": "Memory Loss", "description": "Associated with Alzheimer’s Disease, Dementia, Vitamin B12 Deficiency, Depression, Sleep Disorders, and Brain Injuries. Temporary memory loss may occur due to stress or medications."},
    {"index": "swelling_in_legs_index", "symptom": "Swelling in Legs", "description": "Often indicates Heart Failure, Kidney Disease, Liver Disease (Cirrhosis), Deep Vein Thrombosis (DVT), and Lymphedema. Swelling can also be a side effect of certain medications."},
    {"index": "increased_thirst_index", "symptom": "Increased Thirst", "description": "A common symptom of Diabetes, Dehydration, Diabetes Insipidus, and Kidney Disease. Increased thirst may also result from high salt intake or medications."},
    {"index": "loss_of_taste_or_smell_index", "symptom": "Loss of Taste or Smell", "description": "Common in COVID-19, Upper Respiratory Infections, Sinus Infections, Brain Injuries, Zinc Deficiency, and Parkinson's Disease. Can also be caused by aging, smoking, or nasal polyps."},
    {"index": "tremors_index", "symptom": "Tremors", "description": "Often associated with Parkinson's Disease, Essential Tremor, Multiple Sclerosis, Hyperthyroidism, Anxiety, and Alcohol Withdrawal. Can also be a side effect of certain medications or caffeine."},
    {"index": "hair_loss_index", "symptom": "Hair Loss", "description": "Can indicate Alopecia, Thyroid Disorders, Hormonal Changes, Nutritional Deficiencies, Lupus, and Stress. Sometimes occurs after pregnancy or severe illness."},
    {"index": "muscle_weakness_index", "symptom": "Muscle Weakness", "description": "Seen in Multiple Sclerosis, Muscular Dystrophy, Myasthenia Gravis, Guillain-Barré Syndrome, Chronic Fatigue Syndrome, and Electrolyte Imbalances."},
    {"index": "excessive_sweating_index", "symptom": "Excessive Sweating", "description": "Associated with Hyperthyroidism, Diabetes, Infections, Menopause, Anxiety Disorders, and Hormonal Disorders. Can also be a side effect of certain medications."},
    {"index": "heart_palpitations_index", "symptom": "Heart Palpitations", "description": "Common in Anxiety, Panic Attacks, Arrhythmia, Hyperthyroidism, Anemia, and Heart Disease. Can be triggered by caffeine or medications."},
    {"index": "constipation_index", "symptom": "Constipation", "description": "Occurs with Irritable Bowel Syndrome, Hypothyroidism, Diabetes, Parkinson's Disease, Multiple Sclerosis, and Colorectal Cancer. Often related to diet or medications."},
    {"index": "frequent_urination_index", "symptom": "Frequent Urination", "description": "Associated with Diabetes, Urinary Tract Infections, Overactive Bladder, Enlarged Prostate, Pregnancy, and Multiple Sclerosis. Can be a side effect of diuretic medications."},
    {"index": "numbness_and_tingling_index", "symptom": "Numbness and Tingling", "description": "Common in Multiple Sclerosis, Diabetes, Vitamin B12 Deficiency, Carpal Tunnel Syndrome, Peripheral Neuropathy, and Stroke. Can also indicate nerve compression."},
    {"index": "trouble_sleeping_index", "symptom": "Trouble Sleeping", "description": "Linked to Insomnia, Sleep Apnea, Depression, Anxiety, Chronic Pain, and Restless Legs Syndrome. Can be affected by shift work or jet lag."},
    {"index": "jaundice_index", "symptom": "Jaundice", "description": "Indicates Liver Disease, Hepatitis, Gallbladder Disease, Pancreatic Cancer, Hemolytic Anemia, and certain genetic conditions. Can occur in newborns."},
    {"index": "bleeding_gums_index", "symptom": "Bleeding Gums", "description": "Associated with Gingivitis, Periodontitis, Vitamin C Deficiency, Leukemia, Thrombocytopenia, and Blood Clotting Disorders. Can be worsened by blood thinners."},
    {"index": "hoarseness_index", "symptom": "Hoarseness", "description": "Can indicate Laryngitis, Vocal Cord Nodules, Throat Cancer, GERD, Thyroid Problems, and Neurological Conditions. Often worsened by smoking."},
    {"index": "balance_problems_index", "symptom": "Balance Problems", "description": "Seen in Inner Ear Disorders, Stroke, Multiple Sclerosis, Parkinson's Disease, Brain Tumors, and Vestibular Neuritis. Can be caused by medications."},
    {"index": "irregular_menstruation_index", "symptom": "Irregular Menstruation", "description": "Associated with Polycystic Ovary Syndrome (PCOS), Endometriosis, Uterine Fibroids, Thyroid Disorders, Eating Disorders, and Perimenopause."},
    {"index": "swallowing_difficulties_index", "symptom": "Swallowing Difficulties", "description": "Can indicate Esophageal Cancer, Stroke, Multiple Sclerosis, GERD, Throat Cancer, and Neurological Disorders. Sometimes related to anxiety."},
    {"index": "mood_changes_index", "symptom": "Mood Changes", "description": "Common in Depression, Bipolar Disorder, Anxiety, Hormonal Imbalances, Thyroid Disorders, and Substance Use. Can be a side effect of medications."},
    {"index": "pale_skin_index", "symptom": "Pale Skin", "description": "Often indicates Anemia, Heart Failure, Liver Disease, Vitamin Deficiencies, Hypothyroidism, and Blood Disorders. Can occur with shock."},
    {"index": "enlarged_lymph_nodes_index", "symptom": "Enlarged Lymph Nodes", "description": "Associated with Infections, Autoimmune Diseases, Cancer (especially Lymphoma), HIV/AIDS, Tuberculosis, and Mononucleosis."},
    {"index": "blood_in_stool_index", "symptom": "Blood in Stool", "description": "Can indicate Colorectal Cancer, Hemorrhoids, Inflammatory Bowel Disease, Ulcers, Diverticulitis, and Anal Fissures. Sometimes caused by certain medications."},
    {"index": "muscle_cramps_index", "symptom": "Muscle Cramps", "description": "Common in Dehydration, Electrolyte Imbalances, Pregnancy, Peripheral Artery Disease, Nerve Compression, and Mineral Deficiencies. Can be triggered by exercise."}
]

pc = PineconeClient(
    api_key=PINECONE_KEY
)

def create_embedding(text):
  client = OpenAI(api_key=OPENAI_KEY)

  response = client.embeddings.create(
      input=text,
      model="text-embedding-3-small"
  )

  return response.data[0].embedding

"""
symptoms: string of symptoms (ex. "headache, dizziness, coughing")
namespace: namespace of pinecone db index
return: an array of possible conditions for symptoms
"""
def query_db(symptoms, namespace="medical_symptoms"):
    # connect to db and embed symptoms
    index = pc.Index('hack-kstate', PINECONE_URL)
    symptoms_embedding = create_embedding(symptoms)

    # query vector db
    query_result = index.query(
        vector=symptoms_embedding,
        top_k=2,
        include_values=True,
        namespace=namespace
    )

    # create an array of all matches 
    medical_analysis = []
    for illness in query_result["matches"]:
        var = illness["id"]
        for item in symptom_data:
            if item["index"] == var:
                medical_analysis.append(item["description"])

    for item in medical_analysis:
        print(item)

    return medical_analysis


# DO NOT USE THIS FUNCTION - this is how we initialized our vector db
def initialize_db():
    index = pc.Index('hack-kstate', PINECONE_URL)
    vectors = []
    for illness in symptom_data:
        text = illness["symptom"] + " - " + illness["description"]
        vector = create_embedding(text)
        vectors.append((illness["index"], vector))

    namespace = 'medical_symptoms'
    index.upsert(vectors=vectors, namespace=namespace)