# Supply Chain Management in Hospitals

## S2-25_SEZG628T

### Dissertation Work

### Sayan Pramanick

BITS ID: 2024tm93275

Dissertation carried out at Tipstat Infotech Ltd., Bengaluru

Submitted in partial fulfilment of the M.Tech in Software Engineering WILP Programme

Under the supervision of Jahanvi Solanki

Birla Institute of Technology and Science, Pilani
March 2026

---

# Abstract

This dissertation focuses on the analysis and optimization of hospital supply chain management systems through a software engineering approach. Hospital supply chains play a critical role in ensuring the availability of medicines, consumables, and medical equipment, directly impacting operational efficiency, cost management, and patient care outcomes.

Hospitals frequently face challenges such as stock-outs, overstocking, expiry-related wastage, procurement delays, and lack of real-time inventory visibility. Existing systems, while functional, often lack intelligent decision-support capabilities and predictive analytics. 

This study conducts a structured analysis of hospital supply chain processes and identifies key inefficiencies through literature review and domain analysis. Based on the identified challenges, a modular and scalable software system is proposed that incorporates inventory management, procurement workflows, vendor management, and batch-level expiry tracking.

The proposed system integrates rule-based optimization techniques such as reorder point calculation and introduces intelligent forecasting and alert mechanisms. The architecture emphasizes real-time tracking, automated procurement triggers, and analytics-driven reporting.

The contribution of this dissertation lies in defining a research-driven framework for hospital supply chain optimization, supported by a prototype implementation using simulated datasets. The effectiveness of the proposed system is evaluated using key performance indicators such as stock-out reduction, expiry loss minimization, and process efficiency.

---

# Introduction

Hospital supply chain management is a critical operational function that ensures the timely availability of medical supplies, including pharmaceuticals, consumables, and equipment. Efficient supply chain management directly influences hospital performance, cost efficiency, and patient safety.

Hospitals operate in highly dynamic environments where demand variability, emergency requirements, and regulatory constraints make supply chain management complex. Inefficient supply chain practices can result in stock-outs, increased operational costs, and wastage due to expired inventory.

Despite the availability of digital systems such as Hospital Information Systems and Enterprise Resource Planning solutions, many healthcare institutions continue to face challenges due to fragmented data, lack of real-time visibility, and limited integration across departments. 

This dissertation approaches hospital supply chain management from a software engineering perspective, focusing on the design of scalable, modular, and data-driven systems. The objective is to introduce intelligent decision-support mechanisms that improve efficiency and reduce operational risks.

The methodology follows a structured software engineering lifecycle including literature review, requirement engineering, system design, prototype development, and evaluation using defined KPIs.

---

# Literature Review

## Hospital Supply Chain Management

Hospital supply chain management involves the coordination of procurement, storage, distribution, and utilization of medical resources. Healthcare supply chains differ significantly from traditional supply chains due to demand uncertainty and critical service requirements. Inefficiencies often arise due to poor coordination, lack of transparency, and reliance on manual processes.

## Inventory Optimization Techniques

Inventory optimization models such as Economic Order Quantity, safety stock calculation, and reorder point models are widely used. The reorder point model is expressed as:

RP = (Average Demand × Lead Time) + Safety Stock

This model is fundamental for preventing stock-outs and is incorporated into the proposed system design.

Recent research also explores stochastic models and probabilistic forecasting techniques for improved planning.

## Healthcare Information Systems

Modern hospitals use ERP systems such as SAP and Oracle Healthcare for managing supply chains. These systems provide integration across procurement, inventory tracking, and financial management but are often complex and expensive.

## Artificial Intelligence in Supply Chains

AI-based forecasting using time series analysis and machine learning techniques enables predictive inventory planning by analyzing historical consumption patterns.

## Summary

While advancements exist in supply chain optimization and healthcare IT systems, there remains a gap in integrating intelligent, scalable, and cost-effective solutions tailored for hospital environments.

---

# Problem Statement

Hospital supply chain systems face operational challenges including lack of real-time inventory visibility, inefficient procurement workflows, and wastage due to expiry of medical supplies.

Lack of visibility leads to both stock-outs and overstock situations, while batch-level tracking is often ignored, resulting in financial losses. Existing systems primarily focus on transactional data management rather than intelligent decision support.

The core problem addressed in this dissertation is the absence of an intelligent, integrated, and scalable software framework for hospital supply chain management that enables real-time visibility, predictive planning, and efficient resource utilization.

---

# Existing Systems Analysis

Current systems include ERP-based solutions and hospital information systems. Enterprise systems such as SAP Healthcare SCM are highly scalable but expensive and complex. Oracle SCM provides integration but requires heavy customization. Hospital HIS systems are integrated with clinical workflows but lack advanced analytics. Manual systems are simple but lack automation and real-time visibility.

---

# Research Gap Identification

The research identifies the lack of predictive demand forecasting in hospital systems, absence of batch-level expiry optimization, limited real-time visibility, weak decision-support mechanisms, and lack of scalable solutions for mid-sized hospitals.

---

# Proposed System

The proposed system is a modular and scalable hospital supply chain management solution designed to address the identified challenges.

The system includes inventory management, procurement workflow, vendor management, and alert and reporting modules.

It provides real-time inventory tracking, automated procurement triggers, batch-level expiry monitoring, and analytics-driven decision support. The architecture emphasizes modularity, scalability, and extensibility for future enhancements such as AI-based forecasting.

---

# System Design

The system follows a layered architecture consisting of a presentation layer for user interaction, an application layer for business logic, and a data layer for persistent storage.

The inventory module handles real-time tracking and batch-level management. The procurement module manages automated reorder workflows. The vendor module tracks supplier performance. The alert system handles notifications and reporting dashboards.

---

# Algorithms and Logic

The reorder point calculation is defined as

RP = (AD × LT) + SS

where AD represents average demand, LT represents lead time, and SS represents safety stock.

Demand forecasting is implemented using a moving average method defined as

Forecast = (D1 + D2 + ... + Dn) / n

Expiry alert logic involves tracking inventory at the batch level, calculating days to expiry, and triggering alerts when thresholds are reached.

---

# Evaluation Plan

The system is evaluated using key performance indicators including stock-out reduction rate, inventory turnover ratio, expiry loss reduction, and procurement cycle time.

Evaluation is conducted using simulated datasets and predefined scenarios to measure system effectiveness.

---

# Future Work

Future enhancements include AI-based demand forecasting using time series models, integration with ERP systems, advanced analytics dashboards, and real-time data synchronization.

The project follows a structured plan including literature review, system design, prototype development, testing, and final documentation. 

---

# Conclusion

This dissertation presents a software engineering approach to improving hospital supply chain management. The proposed system addresses inefficiencies such as lack of visibility, poor inventory management, and absence of predictive planning.

By combining modular system design with rule-based optimization and future AI capabilities, the study provides a scalable foundation for intelligent healthcare logistics systems.

---

# Abbreviations

SCM refers to Supply Chain Management. HIS refers to Hospital Information System. ERP refers to Enterprise Resource Planning. EOQ refers to Economic Order Quantity. RP refers to Reorder Point. AD refers to Average Demand. LT refers to Lead Time. SS refers to Safety Stock. KPI refers to Key Performance Indicator. AI refers to Artificial Intelligence.

---

# References

The dissertation is supported by research in healthcare supply chain management, inventory optimization, ERP systems, and predictive analytics, including works by De Vries and Huijsman, Chopra and Meindl, Simchi-Levi, and World Health Organization reports, along with studies on AI-driven forecasting and supply chain analytics.