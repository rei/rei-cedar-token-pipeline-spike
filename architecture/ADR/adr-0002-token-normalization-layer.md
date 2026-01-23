# ADR‑0002: Normalization Layer

## Status  
Planned

## Context  
Cedar receives two ungoverned design‑time inputs from Figma:

- **Raw Figma Variables** (atomic values, references, modes, metadata)  
- **Local Styles** (typography, effects, grids, paint styles, variable bindings)

These inputs reflect design intent but lack semantic typing, naming conventions, platform‑agnostic structure, and governance. They cannot be consumed directly by Style Dictionary or downstream platforms.

The Normalization Layer transforms these raw inputs into the governed, semantically valid **Canonical Token Model** defined in ADR‑0001.

---

## Purpose of the Normalization Layer

The Normalization Layer is responsible for:

- interpreting raw Figma data  
- enforcing governance rules  
- resolving references  
- constructing composite tokens  
- applying naming conventions  
- validating types and values  
- producing a stable, platform‑agnostic canonical structure  

It is the **only** layer allowed to transform raw design input into canonical tokens.

---

## Responsibilities

### **1. Merge Raw Inputs**
Combine:

- `raw-figma-variables.json`  
- `raw-figma-styles.json`  

into a unified intermediate representation.

### **2. Semantic Typing**
Infer canonical `$type` based on:

- Figma variable `resolvedType`  
- style metadata  
- naming conventions  
- Cedar governance rules  

Examples:

- `COLOR` → `color`  
- `FLOAT` → `dimension`  
- text style → `typography`  
- effect style → `shadow`  

### **3. Naming Normalization**
Apply Cedar’s naming conventions:

- hierarchical, semantic paths  
- platform‑agnostic grouping  
- no file‑system or SD‑shaped paths  
- no plugin‑generated names  

### **4. Reference Resolution**
Resolve:

- variable → variable references  
- style → variable bindings  
- composite → atomic references  

Ensure:

- no broken references  
- no circular references  
- all references use DTCG syntax in the canonical model  

### **5. Composite Token Construction**
Convert Local Styles into canonical composite tokens:

- typography  
- shadows  
- grids  
- paint styles  

Each composite token must be represented as a structured object in the canonical model.

### **6. Metadata Isolation**
Move all non‑DTCG metadata into:

