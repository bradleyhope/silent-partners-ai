/**
 * Example network datasets for Silent Partners
 * Contains sample network data for demonstration purposes
 */

// UNCONDITIONAL TOP-LEVEL LOGGING
console.log('🔍 example_data.js loaded and executing');
try {
    console.log('🔍 Window object exists:', !!window);
    console.log('🔍 Document object exists:', !!document);
} catch (e) {
    console.error('🔍 Error accessing window/document:', e);
}

// Initialize the global object
console.log('🔍 Initializing silentPartners object');
window.silentPartners = window.silentPartners || {};
window.silentPartners.exampleData = {};
console.log('🔍 silentPartners object initialized:', window.silentPartners);

// Example network: Trump Family
window.silentPartners.exampleData.trumpFamily = {
    "title": "Trump Family Network 2025",
    "description": "Key relationships in the Trump family business and political network",
    "nodes": [
        { "id": "node_1", "name": "Donald Trump", "type": "person", "importance": 1.0 },
        { "id": "node_2", "name": "Ivanka Trump", "type": "person", "importance": 0.8 },
        { "id": "node_3", "name": "Jared Kushner", "type": "person", "importance": 0.8 },
        { "id": "node_4", "name": "Donald Trump Jr.", "type": "person", "importance": 0.7 },
        { "id": "node_5", "name": "Eric Trump", "type": "person", "importance": 0.6 },
        { "id": "node_6", "name": "Melania Trump", "type": "person", "importance": 0.6 },
        { "id": "node_7", "name": "Trump Organization", "type": "corporation", "importance": 0.9 },
        { "id": "node_8", "name": "Kushner Companies", "type": "corporation", "importance": 0.7 },
        { "id": "node_9", "name": "Republican Party", "type": "organization", "importance": 0.8 },
        { "id": "node_10", "name": "Saudi Investment Fund", "type": "financial", "importance": 0.7 },
        { "id": "node_11", "name": "Tiffany Trump", "type": "person", "importance": 0.4 },
        { "id": "node_12", "name": "Barron Trump", "type": "person", "importance": 0.3 }
    ],
    "links": [
        { "source": "node_1", "target": "node_7", "type": "Founder", "status": "confirmed", "date": "1971" },
        { "source": "node_1", "target": "node_2", "type": "Father of", "status": "confirmed" },
        { "source": "node_1", "target": "node_4", "type": "Father of", "status": "confirmed" },
        { "source": "node_1", "target": "node_5", "type": "Father of", "status": "confirmed" },
        { "source": "node_1", "target": "node_6", "type": "Married to", "status": "confirmed", "date": "2005" },
        { "source": "node_1", "target": "node_9", "type": "Affiliated with", "status": "confirmed" },
        { "source": "node_1", "target": "node_11", "type": "Father of", "status": "confirmed" },
        { "source": "node_1", "target": "node_12", "type": "Father of", "status": "confirmed" },
        { "source": "node_2", "target": "node_3", "type": "Married to", "status": "confirmed", "date": "2009" },
        { "source": "node_2", "target": "node_7", "type": "Executive at", "status": "former", "date": "2017-2021" },
        { "source": "node_3", "target": "node_8", "type": "Owner of", "status": "confirmed" },
        { "source": "node_3", "target": "node_10", "type": "Received funding from", "status": "suspected", "date": "2021" },
        { "source": "node_4", "target": "node_7", "type": "Executive at", "status": "confirmed" },
        { "source": "node_5", "target": "node_7", "type": "Executive at", "status": "confirmed" },
        { "source": "node_8", "target": "node_10", "type": "Received funding from", "status": "suspected", "date": "2022" },
        { "source": "node_9", "target": "node_7", "type": "Supported by", "status": "suspected" }
    ]
};

// Example network: 1MDB
window.silentPartners.exampleData.oneMDB = {
    "title": "1MDB Financial Scandal",
    "description": "Key entities and relationships in the 1Malaysia Development Berhad scandal",
    "nodes": [
        { "id": "node_1", "name": "1MDB", "type": "financial", "importance": 1.0 },
        { "id": "node_2", "name": "Najib Razak", "type": "person", "importance": 0.9 },
        { "id": "node_3", "name": "Jho Low", "type": "person", "importance": 0.9 },
        { "id": "node_4", "name": "Goldman Sachs", "type": "financial", "importance": 0.8 },
        { "id": "node_5", "name": "Tim Leissner", "type": "person", "importance": 0.7 },
        { "id": "node_6", "name": "Malaysian Government", "type": "government", "importance": 0.8 },
        { "id": "node_7", "name": "Abu Dhabi Sovereign Fund", "type": "financial", "importance": 0.7 },
        { "id": "node_8", "name": "PetroSaudi", "type": "corporation", "importance": 0.6 },
        { "id": "node_9", "name": "Good Star Limited", "type": "corporation", "importance": 0.6 },
        { "id": "node_10", "name": "Rosmah Mansor", "type": "person", "importance": 0.6 }
    ],
    "links": [
        { "source": "node_1", "target": "node_2", "type": "Controlled by", "status": "confirmed", "date": "2009-2018" },
        { "source": "node_1", "target": "node_3", "type": "Advised by", "status": "confirmed", "date": "2009-2014" },
        { "source": "node_1", "target": "node_4", "type": "Advised by", "status": "confirmed", "date": "2012-2013" },
        { "source": "node_1", "target": "node_6", "type": "Owned by", "status": "confirmed", "date": "2009-2018" },
        { "source": "node_1", "target": "node_7", "type": "Joint venture with", "status": "confirmed", "date": "2012" },
        { "source": "node_1", "target": "node_8", "type": "Joint venture with", "status": "confirmed", "date": "2009" },
        { "source": "node_2", "target": "node_6", "type": "Prime Minister of", "status": "former", "date": "2009-2018" },
        { "source": "node_2", "target": "node_10", "type": "Married to", "status": "confirmed" },
        { "source": "node_3", "target": "node_9", "type": "Controlled", "status": "confirmed" },
        { "source": "node_4", "target": "node_5", "type": "Employed", "status": "former", "date": "2006-2016" },
        { "source": "node_5", "target": "node_3", "type": "Collaborated with", "status": "confirmed", "date": "2012-2013" },
        { "source": "node_8", "target": "node_9", "type": "Transferred funds to", "status": "confirmed", "date": "2009" },
        { "source": "node_9", "target": "node_3", "type": "Benefited", "status": "confirmed" }
    ]
};

// Example network: BCCI
window.silentPartners.exampleData.bcci = {
    "title": "BCCI Banking Scandal",
    "description": "Key entities and relationships in the Bank of Credit and Commerce International scandal",
    "nodes": [
        { "id": "node_1", "name": "BCCI", "type": "financial", "importance": 1.0 },
        { "id": "node_2", "name": "Agha Hasan Abedi", "type": "person", "importance": 0.9 },
        { "id": "node_3", "name": "Bank of America", "type": "financial", "importance": 0.7 },
        { "id": "node_4", "name": "CIA", "type": "government", "importance": 0.8 },
        { "id": "node_5", "name": "First American Bank", "type": "financial", "importance": 0.7 },
        { "id": "node_6", "name": "Clark Clifford", "type": "person", "importance": 0.6 },
        { "id": "node_7", "name": "Robert Altman", "type": "person", "importance": 0.6 },
        { "id": "node_8", "name": "Sheikh Zayed", "type": "person", "importance": 0.8 },
        { "id": "node_9", "name": "Abu Dhabi", "type": "government", "importance": 0.7 },
        { "id": "node_10", "name": "Sami Nair", "type": "person", "importance": 0.5 }
    ],
    "links": [
        { "source": "node_1", "target": "node_2", "type": "Founded by", "status": "confirmed", "date": "1972" },
        { "source": "node_1", "target": "node_3", "type": "Partially owned by", "status": "former", "date": "1972-1980" },
        { "source": "node_1", "target": "node_4", "type": "Used by", "status": "suspected", "date": "1980s" },
        { "source": "node_1", "target": "node_5", "type": "Secretly owned", "status": "confirmed", "date": "1982-1991" },
        { "source": "node_1", "target": "node_8", "type": "Backed by", "status": "confirmed", "date": "1980s" },
        { "source": "node_1", "target": "node_9", "type": "Backed by", "status": "confirmed", "date": "1980s" },
        { "source": "node_2", "target": "node_10", "type": "Worked with", "status": "confirmed" },
        { "source": "node_5", "target": "node_6", "type": "Chaired by", "status": "confirmed", "date": "1982-1991" },
        { "source": "node_5", "target": "node_7", "type": "Represented by", "status": "confirmed", "date": "1982-1991" },
        { "source": "node_6", "target": "node_7", "type": "Partnered with", "status": "confirmed" },
        { "source": "node_8", "target": "node_9", "type": "Ruler of", "status": "confirmed", "date": "1966-2004" }
    ]
};

// Example network: Epstein
window.silentPartners.exampleData.epstein = {
    "title": "Jeffrey Epstein Network",
    "description": "Key relationships in the Jeffrey Epstein case",
    "nodes": [
        { "id": "node_1", "name": "Jeffrey Epstein", "type": "person", "importance": 1.0 },
        { "id": "node_2", "name": "Ghislaine Maxwell", "type": "person", "importance": 0.9 },
        { "id": "node_3", "name": "Leslie Wexner", "type": "person", "importance": 0.7 },
        { "id": "node_4", "name": "JP Morgan", "type": "financial", "importance": 0.7 },
        { "id": "node_5", "name": "Deutsche Bank", "type": "financial", "importance": 0.7 },
        { "id": "node_6", "name": "The Limited", "type": "corporation", "importance": 0.6 },
        { "id": "node_7", "name": "Epstein Foundation", "type": "organization", "importance": 0.8 },
        { "id": "node_8", "name": "Harvard University", "type": "organization", "importance": 0.7 },
        { "id": "node_9", "name": "MIT Media Lab", "type": "organization", "importance": 0.6 },
        { "id": "node_10", "name": "US Virgin Islands", "type": "government", "importance": 0.5 }
    ],
    "links": [
        { "source": "node_1", "target": "node_2", "type": "Associated with", "status": "confirmed", "date": "1990s-2019" },
        { "source": "node_1", "target": "node_3", "type": "Financial advisor to", "status": "confirmed", "date": "1980s-2007" },
        { "source": "node_1", "target": "node_4", "type": "Client of", "status": "confirmed", "date": "1998-2013" },
        { "source": "node_1", "target": "node_5", "type": "Client of", "status": "confirmed", "date": "2013-2019" },
        { "source": "node_1", "target": "node_7", "type": "Founded", "status": "confirmed" },
        { "source": "node_1", "target": "node_8", "type": "Donated to", "status": "confirmed", "date": "1998-2007" },
        { "source": "node_1", "target": "node_9", "type": "Donated to", "status": "confirmed", "date": "2013" },
        { "source": "node_1", "target": "node_10", "type": "Owned property in", "status": "confirmed", "date": "1998-2019" },
        { "source": "node_3", "target": "node_6", "type": "Founded", "status": "confirmed", "date": "1963" },
        { "source": "node_7", "target": "node_8", "type": "Donated to", "status": "confirmed" },
        { "source": "node_7", "target": "node_9", "type": "Donated to", "status": "confirmed" }
    ]
};

// Example network: Boulos
window.silentPartners.exampleData.boulos = {
    "title": "Michael Boulos Network",
    "description": "Key relationships in the Michael Boulos business network",
    "nodes": [
        { "id": "node_1", "name": "Michael Boulos", "type": "person", "importance": 1.0 },
        { "id": "node_2", "name": "Tiffany Trump", "type": "person", "importance": 0.9 },
        { "id": "node_3", "name": "Boulos Enterprises", "type": "corporation", "importance": 0.8 },
        { "id": "node_4", "name": "SCOA Nigeria", "type": "corporation", "importance": 0.7 },
        { "id": "node_5", "name": "Massad Boulos", "type": "person", "importance": 0.8 },
        { "id": "node_6", "name": "Sarah Boulos", "type": "person", "importance": 0.7 },
        { "id": "node_7", "name": "Lebanese Business Council", "type": "organization", "importance": 0.6 },
        { "id": "node_8", "name": "Nigerian Economy", "type": "financial", "importance": 0.7 },
        { "id": "node_9", "name": "Trump Organization", "type": "corporation", "importance": 0.7 },
        { "id": "node_10", "name": "Donald Trump", "type": "person", "importance": 0.8 }
    ],
    "links": [
        { "source": "node_1", "target": "node_2", "type": "Married to", "status": "confirmed", "date": "2023" },
        { "source": "node_1", "target": "node_3", "type": "Associated with", "status": "confirmed" },
        { "source": "node_1", "target": "node_5", "type": "Son of", "status": "confirmed" },
        { "source": "node_1", "target": "node_6", "type": "Son of", "status": "confirmed" },
        { "source": "node_2", "target": "node_10", "type": "Daughter of", "status": "confirmed" },
        { "source": "node_3", "target": "node_4", "type": "Subsidiary of", "status": "confirmed" },
        { "source": "node_3", "target": "node_8", "type": "Operates in", "status": "confirmed" },
        { "source": "node_4", "target": "node_5", "type": "Led by", "status": "confirmed" },
        { "source": "node_5", "target": "node_6", "type": "Married to", "status": "confirmed" },
        { "source": "node_5", "target": "node_7", "type": "Member of", "status": "confirmed" },
        { "source": "node_9", "target": "node_10", "type": "Owned by", "status": "confirmed" },
        { "source": "node_2", "target": "node_9", "type": "Associated with", "status": "confirmed" }
    ]
};
