// Missing physical properties only. Apply each field only when its existing value
// is exactly "Not compiled"; known source values must remain unchanged.
// Source snapshots retrieved 2026-11-04. Mendeleev references CRC 2014/2016,
// NIST ASD 5.11, Rahm 2016/2017, and Pyykkö & Atsumi 2009. See
// docs/element-reference-sources.md and docs/licenses/mendeleev-MIT.txt.
// 1 eV per particle = 96.4853321233 kJ/mol. Electron attachment uses the
// app's energy-change convention: negative means energy is released.
// Empty database cells are not treated as proof that no measurement exists.
// Theory and estimates stay labeled; no covalent radius replaces atomic radius.

export const elementChemistryReference = {
  "54": {
    "fields": {
      "specificHeat": "0.158 J/g·K (25 °C, 1 bar)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      }
    ],
    "notes": {}
  },
  "61": {
    "fields": {
      "specificHeat": "No evaluated heat-capacity value in the cited reference"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      }
    ],
    "notes": {}
  },
  "84": {
    "fields": {
      "radius": "250 pm (calculated, Rahm et al.)",
      "meltingPoint": "254 °C / 527.15 K",
      "boilingPoint": "962 °C / 1235.15 K",
      "density": "9.2 g/cm³ (near room temperature)",
      "specificHeat": "0.1263 J/g·K (derived from reference molar heat capacity)",
      "ionizationEnergy": "812.22 kJ/mol",
      "electronAffinity": "−183.32 kJ/mol (theoretical/reference estimate)",
      "electronegativity": "2 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "85": {
    "fields": {
      "radius": "247 pm (calculated, Rahm et al.)",
      "meltingPoint": "302 °C / 575.15 K (estimate)",
      "boilingPoint": "336.85 °C / 610 K (estimate; not an established bulk measurement)",
      "density": "7 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "899 kJ/mol",
      "electronAffinity": "−233 kJ/mol (rounded reference value)",
      "electronegativity": "2.2 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "87": {
    "fields": {
      "radius": "258 pm (calculated, Rahm et al.)",
      "meltingPoint": "21 °C / 294.15 K (estimate)",
      "boilingPoint": "676.85 °C / 950 K (estimate; not an established bulk measurement)",
      "density": "1.87 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "392.96 kJ/mol",
      "electronAffinity": "−46.89 kJ/mol (theoretical/reference estimate)",
      "electronegativity": "0.7 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "88": {
    "fields": {
      "radius": "292 pm (calculated, Rahm et al.)",
      "meltingPoint": "696 °C / 969.15 K",
      "boilingPoint": "1736.85 °C / 2010 K (estimate; not an established bulk measurement)",
      "density": "5 g/cm³ (near room temperature)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "509.29 kJ/mol",
      "electronAffinity": "−9.65 kJ/mol (theoretical/reference estimate)",
      "electronegativity": "0.9 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "89": {
    "fields": {
      "radius": "293 pm (calculated, Rahm et al.)",
      "meltingPoint": "1050 °C / 1323.15 K",
      "boilingPoint": "3200 °C / 3473.15 K",
      "density": "10 g/cm³ (near room temperature)",
      "specificHeat": "0.12 J/g·K (25 °C, 1 bar)",
      "ionizationEnergy": "519.11 kJ/mol",
      "electronAffinity": "−33.77 kJ/mol (theoretical/reference estimate)",
      "electronegativity": "1.1 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "90": {
    "fields": {
      "radius": "288 pm (calculated, Rahm et al.)",
      "meltingPoint": "1750 °C / 2023.15 K",
      "boilingPoint": "4785 °C / 5058.15 K",
      "density": "11.7 g/cm³ (near room temperature)",
      "specificHeat": "0.118 J/g·K (25 °C, 1 bar)",
      "ionizationEnergy": "608.5 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "91": {
    "fields": {
      "radius": "285 pm (calculated, Rahm et al.)",
      "meltingPoint": "1572 °C / 1845.15 K",
      "boilingPoint": "4026.85 °C / 4300 K (estimate; not an established bulk measurement)",
      "density": "15.4 g/cm³ (near room temperature)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "568 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.5 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "93": {
    "fields": {
      "radius": "281 pm (calculated, Rahm et al.)",
      "meltingPoint": "644 °C / 917.15 K",
      "boilingPoint": "4173.85 °C / 4447 K (estimate; not an established bulk measurement)",
      "density": "20.2 g/cm³ (near room temperature)",
      "specificHeat": "0.1243 J/g·K (derived from reference molar heat capacity)",
      "ionizationEnergy": "604.53 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "94": {
    "fields": {
      "radius": "278 pm (calculated, Rahm et al.)",
      "meltingPoint": "640 °C / 913.15 K",
      "boilingPoint": "3228 °C / 3501.15 K",
      "density": "19.7 g/cm³ (near room temperature)",
      "specificHeat": "0.1455 J/g·K (derived from reference molar heat capacity)",
      "ionizationEnergy": "581.4 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling scale)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "95": {
    "fields": {
      "radius": "276 pm (calculated, Rahm et al.)",
      "meltingPoint": "1176 °C / 1449.15 K",
      "boilingPoint": "2606.85 °C / 2880 K (estimate; not an established bulk measurement)",
      "density": "12 g/cm³ (near room temperature)",
      "specificHeat": "0.258 J/g·K (derived from reference molar heat capacity)",
      "ionizationEnergy": "576.39 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.13 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "96": {
    "fields": {
      "radius": "276 pm (calculated, Rahm et al.)",
      "meltingPoint": "1345 °C / 1618.15 K",
      "boilingPoint": "3109.85 °C / 3383 K (estimate; not an established bulk measurement)",
      "density": "13.51 g/cm³ (near room temperature)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "578.16 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.28 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Rahm et al. calculated atomic radii (2016, corrected 2017)",
        "url": "https://doi.org/10.1002/chem.201700610"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "Rahm atomic radius: calculated electron-density boundary of an isolated neutral atom. Radius definitions differ; compare values using the same definition."
    }
  },
  "97": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "986 °C / 1259.15 K",
      "boilingPoint": "2626.85 °C / 2900 K (estimate; not an established bulk measurement)",
      "density": "14.78 g/cm³ (near room temperature)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "598 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 168 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "98": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "900 °C / 1173.15 K",
      "boilingPoint": "1469.85 °C / 1743 K (estimate; not an established bulk measurement)",
      "density": "15.1 g/cm³ (near room temperature)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "606.11 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 168 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "99": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "860 °C / 1133.15 K (estimate)",
      "boilingPoint": "995.85 °C / 1269 K (estimate; not an established bulk measurement)",
      "density": "8.84 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "614.46 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 165 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "100": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "1527 °C / 1800.15 K (estimate)",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "9.7 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "627 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 167 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "101": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "827 °C / 1100.15 K (estimate)",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "10.3 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "635 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 173 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "102": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "827 °C / 1100.15 K (estimate)",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "9.9 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "639.33 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 176 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "103": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "1627 °C / 1900.15 K (estimate)",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "15.6 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "478.57 kJ/mol",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "1.3 (Pauling-scale estimate)"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 161 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "104": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "2126.85 °C / 2400 K (estimate; not an established bulk measurement)",
      "boilingPoint": "5526.85 °C / 5800 K (estimate; not an established bulk measurement)",
      "density": "23.3 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "581 kJ/mol (theoretical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 157 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "105": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "29.3 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "656 kJ/mol (theoretical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 149 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "106": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "35 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "753 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 143 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "107": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "37.1 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "743 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 141 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "108": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "40.7 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "733 kJ/mol (semi-empirical estimate)",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "NIST Atomic Spectra Database: ionization energies",
        "url": "https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 134 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "109": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "37.4 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 129 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "110": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "34.8 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 128 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "111": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "Bulk boiling point has not been measured",
      "density": "28.7 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "-151 kJ/mol (theoretical estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 121 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "112": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "9.85 °C / 283 K (estimate; not an established bulk measurement)",
      "boilingPoint": "66.85 °C / 340 K (estimate; not an established bulk measurement)",
      "density": "14 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 122 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "113": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "426.85 °C / 700 K (estimate; not an established bulk measurement)",
      "boilingPoint": "1156.85 °C / 1430 K (estimate; not an established bulk measurement)",
      "density": "16 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "-66.6 kJ/mol (theoretical estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 136 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "114": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "66.85 °C / 340 K (estimate; not an established bulk measurement)",
      "boilingPoint": "146.85 °C / 420 K (estimate; not an established bulk measurement)",
      "density": "9.928 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "No evaluated electron-affinity value in the cited reference",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 143 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "115": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "396.85 °C / 670 K (estimate; not an established bulk measurement)",
      "boilingPoint": "1126.85 °C / 1400 K (estimate; not an established bulk measurement)",
      "density": "13.5 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "-35.3 kJ/mol (theoretical estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 162 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "116": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "435.85 °C / 709 K (estimate; not an established bulk measurement)",
      "boilingPoint": "811.85 °C / 1085 K (estimate; not an established bulk measurement)",
      "density": "12.9 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "-74.9 kJ/mol (theoretical estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 175 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "117": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "449.85 °C / 723 K (estimate; not an established bulk measurement)",
      "boilingPoint": "609.85 °C / 883 K (estimate; not an established bulk measurement)",
      "density": "7.2 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "-165.9 kJ/mol (theoretical estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 165 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  },
  "118": {
    "fields": {
      "radius": "No evaluated atomic-radius value",
      "meltingPoint": "Bulk melting point has not been measured",
      "boilingPoint": "76.85 °C / 350 K (estimate; not an established bulk measurement)",
      "density": "7 g/cm³ (theoretical estimate)",
      "specificHeat": "No evaluated heat-capacity value in the cited reference",
      "ionizationEnergy": "No evaluated first-ionization energy in the cited reference",
      "electronAffinity": "−5.4 kJ/mol (theoretical/reference estimate)",
      "electronegativity": "No established Pauling-scale value"
    },
    "sources": [
      {
        "label": "Mendeleev reference database (CRC / NIST bibliography)",
        "url": "https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc"
      },
      {
        "label": "Pyykkö and Atsumi: single-bond covalent radii",
        "url": "https://doi.org/10.1002/chem.200800987"
      },
      {
        "label": "Periodic Table JSON reference compilation",
        "url": "https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30"
      }
    ],
    "notes": {
      "radiusNote": "A different quantity is available: the calculated single-bond covalent radius is 157 pm (Pyykkö and Atsumi). It is not an isolated-atom radius."
    }
  }
};
