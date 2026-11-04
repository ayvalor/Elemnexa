# Missing element details: reference record

These additions fill fields whose prior value was exactly `Not compiled`. They do not replace existing populated values. A missing entry in a reference database is not evidence that a property has never been measured.

## Physical properties

Retrieved on 2026-11-04:

- [Mendeleev database, revision bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc](https://github.com/lmmentel/mendeleev/tree/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc): the `elements`, `phasetransitions`, `ionizationenergies`, and `propertymetadata` tables were consulted. The database's [bibliography at the same revision](https://github.com/lmmentel/mendeleev/blob/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc/docs/source/references.bib) identifies CRC Handbook editions 95 and 97, NIST ASD 5.11, and the radius publications below. The [MIT notice](licenses/mendeleev-MIT.txt) is retained.
- [Periodic Table JSON, revision a78c7a48fe7235cebd6153161a9e7fa70f0cfb30](https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30): the application's existing supplementary compilation, used for selected heat capacities, estimates, and the rounded astatine electron affinity.
- [Rahm, Hoffmann and Ashcroft, *Atomic and Ionic Radii of Elements 1–96*](https://doi.org/10.1002/chem.201602949), with its [2017 correction](https://doi.org/10.1002/chem.201700610): calculated atomic radii for missing values through curium.
- [Pyykkö and Atsumi, *Molecular Single-Bond Covalent Radii for Elements 1–118*](https://doi.org/10.1002/chem.200800987): an explicitly different radius definition provided in notes when no evaluated atomic radius is available. These values do not replace an atomic radius.
- [NIST Atomic Spectra Database ionization energies](https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html): accessed through the pinned Mendeleev copy, including its theoretical and semi-empirical flags.

Direct Royal Society of Chemistry requests were unavailable in this execution environment. The records above were retrieved online; linked original publications were identified through the database bibliography, not independently fetched. No live network requests are needed by the application.

### Units and interpretation

- Phase-transition temperatures retain the source's kelvin value; Celsius is `K − 273.15`. Estimates for short-lived elements remain labeled. Missing bulk melting/boiling points for elements available only in individual atoms are identified as unmeasured.
- Densities are in g/cm³ near room temperature. The database explicitly identifies astatine, francium, and einsteinium through oganesson densities as theoretical estimates; that distinction is retained.
- CRC heat capacities are J/g·K at 25 °C and 1 bar. Supplementary molar heat capacities are divided by the application's reference molar mass and identified as derived values. A missing evaluated heat capacity is stated explicitly.
- NIST ionization energies use `1 eV = 96.4853321233 kJ/mol` per mole of atoms. Theoretical and semi-empirical values retain their labels and are rounded appropriately.
- Electron affinity follows the existing application's **energy change for electron attachment** convention: a negative number releases energy. Database affinities expressed as positive energy released are sign-reversed. Reference estimates remain identified as estimates. No missing database affinity is silently assigned zero.
- Pauling electronegativity values and estimates are labeled; an absent Pauling value is not replaced with a value from another electronegativity scale.
- Atomic radius depends on definition. Newly supplied Rahm radii describe an isolated neutral atom's calculated electron-density boundary. They should not be compared directly with covalent radii or with older radius values using different definitions.

The per-element `sources` and field notes in `data/element-chemistry.js` identify which references were used. Source snapshots and explicit uncertainty labels make these educational values reviewable; the table does not imply that every quantity is experimentally established.

## Oxidation states and ionic chemistry

`data/element-ion-reference.js` fills 75 previously missing oxidation-state and common-ion entries. Selected states were checked against the pinned Mendeleev `oxidationstates` and `ionicradii` tables. The database's oxidation-state bibliography cites the [reviewed compilation at Wikipedia revision 1253639950](https://en.wikipedia.org/w/index.php?title=Oxidation_state&oldid=1253639950).

Common-ion descriptions are curated educational examples associated with those states. They distinguish a formal oxidation number from an ion's overall charge: mercury(I) is represented by Hg₂²⁺, molybdenum(VI) by molybdate MoO₄²⁻, and technetium(VII) by pertechnetate TcO₄⁻. Hydration, ligands, redox conditions, and pH affect actual solution species. The elemental form has oxidation state zero even when the displayed list concentrates on useful compound states.

Observed tracer-scale chemistry for elements 104–108 is distinguished from unestablished common compound chemistry for elements 109–118. Theory-only oxidation-state lists are not presented as experimentally observed ions.
