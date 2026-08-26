# Testing Guideline — customer-supplied

Source: `OFFICIAL - Testing Guideline - Dev Environment.xlsx`, supplied by the
customer. Extracted verbatim on 25 Aug 2026 — the wording below is theirs, not
mine. The original workbook sits beside this file.

**This is the functional specification.** It states expected behaviour screen by
screen, which makes it a higher authority than anything read off the running
system: the live build is what exists, this is what it is supposed to do.

**Test environment: `https://erp-staging.linhlongengineering.com/`** — staging,
not the production URL used for research so far.

---

## PR - EC - Create PR


### Create the new RFQ (Project Requirement)
- Use case: Used when a new customer quotation request is received and the PM needs to create a new RFQ to capture the initial project and customer information as the starting point for the quotation process.
* This use case applies only to existing customers.

*Create the new RFQ*

Steps:
- 1. Click the Add New button

Expected:
- Display the New Project Requirement modal

Expected:
- Allow user enter or select information in required and optional fields

Expected:
- In this mode, only the Save button is displayed and it is disabled by default.

Expected:
- After the user enters or selects values for all required fields, the Save button becomes enabled.

Expected:
- The system automatically generates and displays the No. as the H1 header for a newly created Project Requirement, using the next sequential RFQ number.

Steps:
- 2.Enter or select required and optional fields
- 2.1. General information section

Expected:
- General information: This section captures the basic customer, project, and quotation details required to create and manage the RFQ.
- It provides the foundational information used throughout the quotation process.

Steps:
- |_ New Customer? (uncheck)

Expected:
- - New Customer?: Indicates whether the RFQ is created for a new customer not yet available in the system.
- By default, this checkbox is not checked.

Expected:
- Since this checkbox is unchecked by default, the system does not apply this option unless the user checks it.
- The Customer field is displayed as a dropdown list that allows the user to select an existing customer (in Customer Management) from the system.

Steps:
- |_ Customer

Expected:
- - Customer: Identifies the customer associated with the RFQ.
- Displays as a dropdown field populated from Customer Management

Expected:
- Inactive customers are not displayed in the list.

Steps:
- |_ Customer Contact

Expected:
- - Customer Contact: Specifies the contact person representing the customer for this RFQ. (defined for the selected customer in Customer Information.)

Expected:
- This field is read-only.

Expected:
- If the selected customer has only one customer contact, the system automatically populates this field with that contact.

Expected:
- If the selected customer has more than one customer contact, the system automatically populates this field with the first contact in the list.

Expected:
- The user can select a different customer contact from the list.

Steps:
- |_ Project Name

Expected:
- - Project Name: Specifies the name of the project related to the RFQ for identification and tracking purposes
- Allows the user to enter the project name

Steps:
- |_ ITAR

Expected:
- - ITAR: Indicates whether the project is subject to ITAR compliance requirements.
- If the RFQ is marked as ITAR = true, only users whose account has ITAR = true can access and view it.

Expected:
- Users whose account has ITAR = true can view all RFQs, including those with ITAR = true and ITAR = false.

Expected:
- Users whose account has ITAR = false can view only RFQs with ITAR = false.

Steps:
- |_ Project Type

Expected:
- - Project Type: Specifies the type of project for the RFQ. It is used to classify the RFQ based on the project’s nature and may affect related workflow, checklist, or assignment setup.
- Allows the user to select the appropriate project type for the RFQ.

Expected:
- Available options:
- |_ NPI - Validation Production: Used for new product introduction projects in the validation production stage.
- |_ Production Box Build: Used for box build projects in mass or standard production.
- |_ One Time Build: Used for projects that are built only once for a specific need.
- |_ Reference Design: Used for projects based on a reference design provided as a baseline.
- |_ Test Development - Low Vol: Used for test development projects with low production volume.
- |_ Test Development - High Vol: Used for test development projects with high production volume

Expected:
- If the selected value is NPI - Validation Production, Production, Box Build, or Test Development - High Vol, the Checklist & Assignment tab displays an additional Engineering Checklists panel.

Steps:
- |_ Order Type

Expected:
- - Order Type: Specifies the order category of the RFQ and indicates whether the request is a new order, a repeat order, or a revision change.
- Allows the user to select the appropriate order type for the RFQ.

Expected:
- Available options:
- |_ New: Used when the RFQ is created for a new order that has not been quoted or processed before.
- |_ Repeat: Used when the RFQ is created for an order that has been previously quoted or processed and is being requested again.
- |_ Rev Change: Used when the RFQ is created for a revision change to an existing order or quotation.

Expected:
- If selected value is Repeat, the Historical RFQ field is displayed below
- Allowing the user to select an existing RFQ associated with the selected customer in order to copy basic information from that RFQ and reduce re-entry effort.

Steps:
- |_ Historical RFQ

Expected:
- - Historical RFQ: Used to copy basic information from the selected RFQ to reduce re-entry effort.
- Precondition: Displays when selected Order Type is Repeat

Expected:
- The option list is populated with RFQs corresponding to the selected existing customer.

Steps:
- |_ Customer Type

Expected:
- - Customer Type: Specifies the customer supply model for the RFQ, used to define how materials or components are supplied and managed for the project.
- Allows the user to select the appropriate customer type for the RFQ

Expected:
- Available options:
- |_ Consigned: The customer provides the required materials or components.
- |_ Managed Consigned: The customer provides the materials or components, but they are managed by the company.
- |_ Mixed: Materials or components are supplied by both the customer and the company.
- |_ Turnkey: The company is fully responsible for providing and managing all materials or components.

Steps:
- |_ Due Date

Expected:
- - Due Date: Specifies the expected due date of the RFQ, used to indicate the target date for quotation completion or submission.
- Allows the user to enter or select the due date for the RFQ.

Expected:
- Displays the placeholder in month/day/year format by default.

Expected:
- Accepts the date in MM/DD/YYYY format

Steps:
- |_ Assigneed To

Expected:
- - Assigneed To: Specifies the user responsible for handling the RFQ
- Allows the user to select a different assignee

Expected:
- The default value is the currently logged-in user.

Expected:
- Only one assignee can be selected.

Expected:
- After the RFQ is created successfully, an email notification is sent to the assigned user.

Steps:
- |_ Created Date

Expected:
- - Created Date: Used to record the RFQ creation timestamp for tracking, audit, and reference purposes.
- Displays the date and time when the RFQ was created

Expected:
- The value is automatically populated by the system and is read-only.

Expected:
- Displays in MM/DD/YYYY HH:MM:SS format.

Steps:
- |_ Priority

Expected:
- - Priority: Used to indicate the urgency or importance of the RFQ and help prioritize handling and follow-up.
- Allows the user to set the RFQ priority using a rating input.

Expected:
- Displays a tooltip on hover corresponding to the selected level: Low, Medium, or High.

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Customer, Project Name, Order Type, Customer Type, Due Date, Assigned To, and Priority.
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Expected:
- A red asterisk (*) is displayed next to each required field label.

Steps:
- 2.2. Specific Requirements tab

Expected:
- This tab is used to capture detailed requirements and supporting information for the RFQ.
- It helps define the quote configuration, technical specifications, special requirements, and additional notes that should be considered during quotation preparation and review.

Expected:
- The section is organized into the following areas:
- |_ Quote Configuration: Defines the main quotation setup and business focus.
- |_ Technical Specifications: Captures the technical requirements of the RFQ.
- |_ Special Requirements & Options: Records special conditions or optional requirements.
- |_ Additional Notes: Provides additional information or clarification.

Steps:
- |_ Quote Configuration > Quote Focus

Expected:
- - Quote Focus: Specifies the quotation focus or business objective for the RFQ, used to identify the pricing or supply strategy applied to the quote.
- Allows the user to select the appropriate quote focus for the RFQ.

Expected:
- Available options:
- |_ Production - Competitive Cost: Used when the quotation is focused on supporting production demand with a competitive cost target.
- |_ Stock - High Cost: Used when the quotation is prepared for stock supply and a higher cost scenario is acceptable or expected.
- |_ Stock - Low Cost: Used when the quotation is prepared for stock supply with emphasis on lower cost.
- |_ OTHER: Used when the quotation focus does not fall under the predefined options.

Steps:
- |_ Quote Configuration > Material Package Type

Expected:
- - Material Package Type:  Specifies the packaging type of the materials requested for the RFQ, used to indicate how the materials should be supplied or packaged for quotation purposes.
- Allows the user to select the material packaging type for the RFQ.

Expected:
- Available options
- |_ Cut Tape: Materials are supplied in cut tape form, typically in smaller quantities.
- |_ Reels: Materials are supplied in full reel packaging.
- |_ $50 Reels: Materials are supplied in reel packaging with a reel charge of $50.
- |_ $25 Reels: Materials are supplied in reel packaging with a reel charge of $25.

Steps:
- |_ Quote Configuration > Markup

Expected:
- - Markup: Specifies the markup value applied to the quotation.
- Allows the user to enter a numeric value greater than or equal to 0.

Expected:
- If the entered value is less than 0, an error message is displayed below the field in red text: "Number must not be negative."

Steps:
- |_ Quote Configuration > Acceptable LeadTime In Day

Expected:
- - Acceptable LeadTime In Day:  Specifies the maximum acceptable lead time for the RFQ in days, used to indicate the expected delivery timeline that is acceptable for quotation consideration.
- Allows the user to enter a numeric value greater than or equal to 0

Expected:
- If the entered value is less than 0, an error message is displayed below the field in red text: "Number must not be negative."

Steps:
- |_ Quote Configuration > Item Ant Quantities To Quote

Expected:
- - Item Ant Quantities To Quote: Specifies the items and corresponding quantities to be included in the quotation, used to provide the detailed product and quantity information required for quote preparation.
- Allows the user to enter both text and numeric values.

Steps:
- |_ Technical specifications > Build Requirement

Expected:
- - Build Requirement:  Defines the production scope required for the RFQ, used to identify what level of assembly or build should be quoted.
- Allows the user to select the applicable build requirement.

Expected:
- Available options
- |_ System: Used when the quotation applies to a complete system build.
- |_ PCBA: Used when the quotation applies to printed circuit board assembly only.
- |_ PCBA + System: Used when the quotation applies to both PCBA and full system build.
- |_ Sub-assy Box Build: Used when the quotation applies to a sub-assembly box build.
- |_ Sub-assy PCBA: Used when the quotation applies to a sub-assembly PCBA build.

Steps:
- |_ Technical specifications > Test Requirements

Expected:
- - Test Requirements: Defines the testing scope required for the RFQ, used to identify what testing process should be included in the quotation.
- Allows the user to select the applicable test requirement.

Expected:
- Available options
- |_ Burn-in: Used when burn-in testing is required.
- |_ Functional: Used when functional testing is required.
- |_ Flying Probe: Used when flying probe testing is required.
- |_ ICT/ESS: Used when ICT or ESS testing is required.
- |_ N/A: Used when no test requirement applies.

Steps:
- |_ Technical specifications > Assembly Turn Time

Expected:
- - Assembly Turn Time: Specifies the expected assembly turnaround time for the RFQ, used to indicate the required time frame for completing the assembly process.
- Allows the user to enter both text and numeric values."

Steps:
- |_ Technical specifications > Excess and MOQ

Expected:
- - Excess and MOQ: Indicates how excess quantity and minimum order quantity should be considered in the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ None: No special consideration for excess quantity or MOQ.
- |_ Low: Low excess quantity or MOQ is acceptable.
- |_ OK: Excess quantity or MOQ is acceptable.

Steps:
- |_ Technical specifications > Net Consigned Inventory

Expected:
- - Net Consigned Inventory: Indicates whether net consigned inventory is provided for the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ No: No net consigned inventory is provided.
- |_ Yes-No Charge: Net consigned inventory is provided at no additional charge.

Steps:
- |_ Technical specifications > Rocket Consigned Inventory

Expected:
- - Rocket Consigned Inventory: Indicates whether rocket consigned inventory is provided for the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ None: No rocket consigned inventory is provided.
- |_ Yes - No Charge: Rocket consigned inventory is provided at no additional charge.
- |_ Yes - Charge: Rocket consigned inventory is provided with additional charge.

Steps:
- |_ Special Requirements & options

Expected:
- - Special Requirements & option: Used to capture special conditions or optional requirements that should be considered in the quotation.
- Allows the user to select one or more applicable options.

Expected:
- Available options:
- |_ Conformal Coating: Indicates that conformal coating is required.
- |_ Provide Alt AML For Out Stock: Indicates that an alternate approved manufacturer list should be provided for out-of-stock materials.
- |_ Broker: Indicates that broker sourcing is allowed or required for material supply.

Steps:
- |_ Additional notes > Customer specific needs

Expected:
- - Customer specific needs: Used to capture customer-specific requirements, requests, or notes related to the RFQ.
- Allows the user to enter and format content in the editor section.

Steps:
- |_ Additional notes > Internal notes

Expected:
- - Internal notes: Used to capture internal comments, notes, or additional information for reference during RFQ handling.
- Allows the user to enter and format content in the editor section.

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Quote Focus, Material Package Type, Markup, Acceptable LeadTime In Day, Item Ant Quantities To Quote, Build Requirement, Test Requirements, Excess and MOQ, Net Consigned Inventory, Rocket Consigned Inventory
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Steps:
- 2.3. Checklist & Assignment tab

Expected:
- Checklist & Assignment: Used to assign related roles and manage checklist items for the RFQ, helps track required documents, tasks, and responsible users during the quotation process.

Expected:
- The tab is organized into the following areas:
- |_ Assignee: Used to assign responsible users to specific roles involved in RFQ handling, such as Program Manager, Buyer, and Engineer.
- |_ Program checklist: Used to record and track program-related checklist items that must be completed or reviewed during the quotation process.
- |_ Engineering checklist: Used to record and track engineering-related checklist items that must be completed or reviewed during the quotation process.
- (This panel is displayed only when the selected Project Type is one of the following: NPI - Validation Production, Production, Box Build, or Test Development - High Vol.)
- |_ Attached Documents table: Used to display and manage documents attached to the selected assignment or RFQ, including document details, assignee, upload information, and status.

Steps:
- |_ Assignee > Program Manager

Expected:
- - Program Manager: Used to assign the Program Manager responsible for coordinating and managing the RFQ process.
- Helps identify the primary person in charge of program-related follow-up, communication, and document handling.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Program Manager has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Program Manager to another active user.

Steps:
- |_ Assignee > Buyer

Expected:
- - Buyer: Used to assign the Buyer responsible for purchasing-related activities in the RFQ process.
- Helps identify the person in charge of material sourcing, pricing, and supplier coordination.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Buyer has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Buyer to another active user.

Steps:
- |_ Assignee > Engineer

Expected:
- - Engineer: Used to assign the Engineer responsible for technical review and engineering-related activities in the RFQ process.
- Helps identify the person in charge of technical evaluation, requirement review, and engineering support.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Engineer has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Engineer to another active user.

Steps:
- |_ Program Checklists panel

Expected:
- - Program Checklits: Used to display and manage the checklist items required for the Program Manager during the RFQ process, helps ensure that all program-related tasks, documents, or review items are identified and tracked.
- Allows the user to check completed or applicable checklist items.

Expected:
- Display the The checklist options are configured in Sales Management > Configuration > General Settings > Program Manager Checklist.

Expected:
- The system displays checklist items dynamically based on that configuration.
- If there are how many rows configured in Program Manager Checklist, there will be the same number of checklist rows displayed in the Program Checklists panel for selection.

Expected:
- When the user checks any checklist item in this panel, the Attached Documents table displays one additional row with the corresponding information.

Steps:
- |_ Engineering Checklists panel

Expected:
- Pre-condition: This panel is displayed only when the selected Project Type is one of the following: NPI - Validation Production, Production, Box Build, or Test Development - High Vol.

Expected:
- - Engineering Checklists: Used to display and manage engineering-related checklist items required during the RFQ process, helps ensure that technical review tasks, engineering validations, or required engineering documents are identified and tracked.
- Allows the user to check completed or applicable checklist items.

Expected:
- Display the The checklist options are configured in Sales Management > Configuration > General Settings > Engineer Checklist

Expected:
- The system displays checklist items dynamically based on that configuration.
- If there are how many rows configured in Engineer Checklist, there will be the same number of checklist rows displayed in the Engineer Checklist panel for selection.

Expected:
- When the user checks any checklist item in this panel, the Attached Documents table displays one additional row with the corresponding information.

Steps:
- |_ Attached Documents table:

Expected:
- - Attached Documents table:  Used to display and manage document items corresponding to the selected checklist entries, helping track document submission, assignment, upload information, completion status, and follow-up actions for each required document during the RFQ process.

Expected:
- The Attached Documents table includes the following columns in order:
- |_ Type
- |_ Document Name
- |_ Uploaded By
- |_ Uploaded Date
- |_ Assignee
- |_ Status
- |_ Actions

Expected:
- The Type column displays the checklist name corresponding to the selected item.

Expected:
- The Document Name column displays the name of the attached document, if available.

Expected:
- After a file is uploaded, the user can download the uploaded file from the corresponding checklist row.

Expected:
- After a file is uploaded, the user can remove the uploaded file from the corresponding checklist row.

Expected:
- The Uploaded By column displays the user who uploaded the document (after completed create the RFQ), if available.

Expected:
- The Uploaded Date column displays the date when the document was uploaded (after completed create the RFQ), if available.

Expected:
- The Assignee column allows the user to assign the responsible user for that document item.
- |_ If the checklist item belongs to Program Checklists, the default assignee is the selected Program Manager, and the user can change it to another user.
- |_ If the checklist item belongs to Engineering Checklists, the default assignee is the selected Engineer, and the user can change it to another user.

Expected:
- The Status column displays the current document status.
- |_ The default status is To do, displayed with a red label.
- |_ The status is In Progress, displayed with a cyan label, when a file has been uploaded but has not yet been approved.
- |_ The status is Completed, displayed with a green label, when a file has been uploaded and approved.

Expected:
- The Actions column provides available actions for document handling, including action buttons in the following order: Upload and Approve.
- |_ If a checklist row exists but no file has been attached, the Upload button is enabled and the Approve button is disabled.
- |_ If a checklist row exists and a file has been attached (after saving RFQ), both the Upload button and the Approve button are enabled.
- |_ If a checklist row exists, a file has been attached, and the document has been approved, both the Upload button and the Approve button are disabled.

Expected:
- If no checklist item is selected, the table displays no corresponding document rows.

Expected:
- When a checklist item is selected, a corresponding row is added to the table.

Expected:
- When a checklist item is unselected, the corresponding row is removed from the table.

Steps:
- [Validation] - UI

Expected:
- Required fields are marked with a red asterisk (*) on the right side:
- - In general information: Customer, Project Name, Order Type, Customer Type, Due Date, Assigned To, Priority
- - Specific Requirement: Quote Focus, Material Package Type, Markup, Acceptable LeadTime In Day, Item Ant Quantities To Quote, Build Requirement, Test Requirements, Excess and MOQ, Net Consigned Inventory, Rocket Consigned Inventory
- - Checklists & Assignment: Program Manager, Buyer

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Program Manager, Buyer
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Steps:
- 2.4. Activity Logs tab:

Steps:
- 3. Click the Save button

Expected:
- The Save button is enabled only when all required fields have been selected and entered.

Expected:
- The Save button remains disabled if any required field has not been selected or entered.

Expected:
- After the RFQ is created successfully, the screen is displayed in view mode

Expected:
- After the RFQ is created successfully, allowing the user to review all information entered during RFQ creation

Expected:
- After the RFQ is created successfully, the system sets the RFQ status to New.

Expected:
- After the RFQ is created successfully, the system displays the following buttons in order: Edit, BOM Comparison, Run Quotation, and Cancel.

Expected:
- After the RFQ is created successfully, the system sends a notification email about the successful creation of the new RFQ to the users assigned in the Program Manager and Engineering checklist sections.

Expected:
- If the same user is assigned to both the Program Manager and Engineer roles, the system sends only one email to that user.

Expected:
- Allow user to use modal window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close


## PR - EC - Quick Quote


### Quick Quote (New BOM)
- Use case: Used when a new customer quotation request is received. PM creates a new RFQ as the starting point for preparing the quote.
* This use case applies only to existing customers.


### Step 1 - Config BoM

*Show quoting information*

Steps:
- 1. System show default quoting information get from Project Requirement

Expected:
- By default, system get value from project requirements
- - Customer: Specific customer information, including [Customer Code] - Full Customer name

Expected:
- - Quote Focus: Primary optimization goal for the quote.
- |_ Stock High Cost: highest-cost in-stock option; favors authorized/traceable suppliers
- |_ Stock-Low Cost: cheapest in-stock option
- |_ Production-Competitive Cost: best future production price; full-package offers only, shortest lead time first
- |_ Other: no auto-selection; buyer chooses supplier manually

Expected:
- - Material Package Type: The packaging logic that applies to all lines in the quotation.
- |_ Cut Tape: Unfixed package; material can be purchased in flexible quantities based on demand, without requiring full standard packaging multiples.
- |_ Reel: Fixed package; material must be purchased in multiples of the supplier’s MOQ or reel size.
- |_ $25 Reels: Applies reel-based purchasing logic using the defined $25 reel rule or threshold.
- |_ $50 Reels: Applies reel-based purchasing logic using the defined $50 reel rule or threshold.

Expected:
- - Mark up: Markup value used in cost computation to apply margin or pricing uplift to the calculated material cost.

Expected:
- - Item Ant Quantities to Quote: The anticipated build quantities or quoting volume scenarios from project requirements.

Expected:
- - Customer Special Need:  Any customer-specific requirements that may affect quoting, sourcing, lead time, compliance, or packaging.

Expected:
- - Internal Notes: Internal project notes or guidance relevant to the quotation process.

Expected:
- - Attachments: Supporting files associated with the project requirements.
- |_ User can view less or more files by clicking on "View More

*[Optional] Update quoting information*

Steps:
- 2. System allow user can change value fields: Quote Focus, Material Package Type, Markup

Expected:
- User can update Quote Focus, Material Package Type, and Markup and values are applied in the next quoting steps

*Select quoting type*

Steps:
- 3. Select Action = "Import New BoM"

Expected:
- Precondition: Only show this option when user attach at least 1 file in this corresponding project requirements

Expected:
- System will show form to allow user config BoM file want to run quote

Expected:
- Config Bom file form have 2 sections: BoM Options & Assembly Details

Steps:
- 4. In BoM options section

Expected:
- Uses the default template configured in Inventory Management.
- (The template selection is hidden from the user to prevent incorrect template selection.)

Steps:
- 4.1. Please select an attachment you would like to process

Expected:
- This field allows the user to select the uploaded BoM file that will be used for the quoting process.

Expected:
- The selectable file source comes from the Attachments list in the current Project Requirement.

Expected:
- The system accepts only .xlsx files for selection.

Expected:
- If there is only 1 valid attachment, the system automatically selects that file in this step.

Expected:
- If there are multiple uploaded BoM files in the current Project Requirement, the user must select which file will be used to run the quote.

Steps:
- 4.2. File Name

Expected:
- The File Name field displays the name of the selected attachment.

Expected:
- This field is automatically populated after the user selects a file.

Expected:
- This field is read-only.

Steps:
- 4.3. Select template

Expected:
- This field allows the user to select an existing BoM template to map and validate the uploaded BoM file.

Expected:
- The selected template is used to ensure the uploaded file contains the required columns: Qty, MFG, MPN

Expected:
- The system uses the selected template to validate whether the uploaded BoM file structure matches the expected format.

Expected:
- If the user selects the wrong template for the uploaded BoM file, and the system cannot detect the required header values (Qty, MFG, MPN) from the uploaded file based on that template:
- |_ the system displays an error message,
- |_ and prevents navigation to Step 2.

Steps:
- 4.4. Select Column Detection

Expected:
- This field defines which column will be used as the unique identifier when the system detects and matches parts across records.

Expected:
- The selected value is typically: part number, rev, part source, qty per, mfg, mfgpn, level, description

Expected:
- The system uses this selected column to distinguish quote lines correctly.

Expected:
- If the user selects part_number or description, but the selected field has no value in the uploaded file, the system cannot detect records correctly.

Expected:
- In such case, the system may incorrectly merge multiple quote lines into a single line.

Steps:
- 4.5. Don't see your template?

Expected:
- This option allows the user to create a new BoM template by customer when no suitable existing template is available.

Expected:
- This option is used when the user cannot find a matching template for the uploaded BoM file.

Expected:
- The option should be enabled when no Select Template value has been chosen.

Expected:
- The option should be disabled after the user has selected a template in Select Template.

Expected:
- When used successfully, the user can create a new customer-specific BoM template for future use.

Steps:
- 5. In Assembly details section
- 5.1. Enter the "Assembly Part Number" field

Expected:
- - Assembly Part Number: Used to specify the customer's assembly part number for the RFQ item.
- This field is used together with the Revision field to identify a unique part.

Expected:
- Allow the users enter input is letters or numbers

Expected:
- After the user enters a value and clicks outside the field, the system automatically prefixes the entered value with the customer code in the format: 0CustomerCode-Part Number (for example: 0455-3032606)

Steps:
- 5.2. Enter the "Revision" field

Expected:
- - Revision: Used to specify the revision level of the assembly part number.
- This field is used together with the Assembly Part Number to identify and distinguish a unique part version.

Expected:
- Allow the users enter input is letters or numbers

Steps:
- 5.3. Enter the "Description" field

Expected:
- - Description: Used to provide a brief description of the assembly item.
- This field helps users identify and understand the part more clearly during RFQ review and processing.

Expected:
- Allow the users enter input is letters or numbers

Steps:
- 6. Adjust Build Quantity' value (optional)

Expected:
- Build Quantity: The quantity of products requiring a price quote, used as the basis for calculating material requirements.
- Build Quantity' value defaults to 1, user can change another value

Steps:
- [Validation] If the user adjust Build Quantity <= 0

Expected:
- The value automatically reverts to the default value of 1.

Steps:
- 7. Adjust Attrition Set' value (optional)

Expected:
- Attrition Set' value defaults to 1, user can change another value
- Attrition Set: The wastage allowance added to material requirements when calculating the quotation.

Steps:
- [Validation] If the user adjust Attrition Set <= 0

Expected:
- The value automatically reverts to the default value of 1.

*Next step*

Steps:
- 8. Click Next button

Expected:
- Parses BOM from system using Indented BoM template. Proceeds to Step 2.

Steps:
- [Validation] if the user does not fill in all the required fields

Expected:
- Display error in corner bottom-right  is "Please input information for assemblyPartNumber, partRev, partDesc"

Steps:
- 9. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 2 - Review BoM

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- - By default, system get value from step 1
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

Steps:
- [Optional] Update Build Qty' and Attrition Set's value

Expected:
- User can update Build Qty' and Attrition Set's value or not and values are applied in the next quoting steps

Steps:
- [Validation] If the user adjust Build Quantity and Attrition Set <= 0

Expected:
- The value automatically reverts to the default value of 1.

*Search & Filter*

Steps:
- 2. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG".

Steps:
- 2.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 2.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 2.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 2.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 3. Perform a filter

Expected:
- The filters are displayed in the following order from left to right: Is Exclude? (Include in quotation = FALSE), Missing Manufacturer

Expected:
- Status display default status is uncheck (both 2 filters)

Steps:
- 3.1. Filter by Is Exclude?

Expected:
- When the filter is selected, only BOM lines marked as excluded from quotation are displayed.

Expected:
- If there is all BOM lines marked as included from quotation, "No records available" is displayed.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Expected:
- When the user checks any of those rows, that BOM line is immediately removed from the filtered list and marked as Is Exclude.

Steps:
- 3.2. Filter by Missing Manufacturer

Expected:
- When the filter is selected, only BOM lines without manufacturer data are displayed.

Expected:
- If there is no BOM lines without manufactuer, "No records available" is displayed.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 4.
- 4.1. BoM detail format is displayed

Expected:
- BOM details are displayed in the format of the default template, which is configured in Inventory Management.

Expected:
- The columns Number, ROCKET_PN, Revision, Part Description, Part Source, and Quantity should be frozen, allowing users to scroll horizontally and still view the remaining columns.

Expected:
- Data from BoM file, system auto:
- Lines with the same Part Number and Revision are merged into a single line.

Expected:
- The Qty Need to Quote value is the sum of all merged line quantities.

Expected:
- This merging rule applies to parts used across multiple sub-assemblies or phantom levels.

Expected:
- The system identifies unique parts for merging based on Part Number and Revision.

Expected:
- The merging logic must work independently of the Select Column Detection value selected in Step 1.

Expected:
- If the selected template does not contain sufficient fulfill data, the system still maintains the correct merging rule based on Part Number and Revision.

Steps:
- 4.2. Verify checkbox selection

Expected:
- Each BOM line displays a selection checkbox.

Expected:
- Users can check or uncheck selectable BOM lines.

Expected:
- BOM lines with Part Source = MAKE or MAKE/PHANT are automatically marked as Is Exclude and are unchecked by default, because these parts are internally manufactured rather than externally purchased, so they are not required for supplier quotation.

Expected:
- BOM lines with Qty = 0 are automatically marked as Is Exclude and are unchecked by default.

Expected:
- If Part Source has no value, the system does not auto-exclude the BOM line based on Part Source alone.

Expected:
- Users can manually re-check BOM lines with Part Source = MAKE or MAKE/PHANT if needed.

Expected:
- Clicking the header checkbox selects all rows.

Expected:
- Clicking the header checkbox again deselects all rows.

Expected:
- Checkbox states are updated correctly based on user actions and auto-exclude conditions.

Expected:
- BOM lines marked as Is Exclude are not included in the quotation process unless the user manually re-checks them.

Steps:
- 4.3. Verify the display of Number

Expected:
- The NUMBER column is displayed.

Expected:
- Each BOM line shows the correct line number.

Expected:
- Line numbers are displayed in ascending sequential order.

Expected:
- The line number shown matches the corresponding BOM row.

Steps:
- 4.4. Verify the display of Rocket PN (Part Number)

Expected:
- Part numbers - Rev that already exist in Part Master are displayed with a green background.

Expected:
- Part numbers - Rev that already exist in Part Master are displayed with a green background.

Expected:
- Part numbers - Rev that do not exist in Part Master are displayed with a red background.

Expected:
- A red background indicates that the part has not been created in Part Master yet.

Expected:
- The user cannot confirm Project Requirement until all missing part numbers have been created in Part Master.

Steps:
- 4.5. Verify the display of Revision

Expected:
- Displays the correct revision of a part or BOM item, helping to identify the current version of the component or record.

Steps:
- 4.6. Verify the display of Part description

Expected:
- Displays the part description accurately, making it easy for users to identify the component's characteristics and name.

Steps:
- 4.7. Verify the display of Part source

Expected:
- Displays the correct part source (e.g., MAKE, BUY, MAKE/PHAN, FLRSTK, MAKE/BUY, and PACKAGING), helping users understand how the part is supplied or managed.

Steps:
- 4.8. Verify the display of Quantity

Expected:
- Displays the exact quantity of parts required in the BOM, facilitating material calculations and price quotations.

Steps:
- 4.9. Verify the display of Level

Expected:
- Displays the correct structural level of the part within the BOM, helping to identify the component's position within the parent-child hierarchy.

Steps:
- 4.10. Verify the display of MFG

Expected:
- Displays the correct part manufacturer, helping to identify the component's source of manufacture.

Expected:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.

Expected:
- The background color is displayed in yellow because the manufacturer value already exists in Manufacturer Management.

Steps:
- 4.11. Verify the display of MPN

Expected:
- Displays the correct manufacturer part number, enabling accurate identification of components based on the specific manufacturer.

Expected:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.

*Next step*

Steps:
- 5. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Previous, Next

Steps:
- 5.1. Click Next button

Expected:
- System computes TOTAL QTY = QtyPer × BuildQty + Attrition × AttritionSet per line.

Expected:
- Display Review Excluded Parts dialog. User review those excluded part(s) as listed. These parts will not be used to quote from Nexar and cannot be recalled
- Warning: After Run Quote in Step 3, excluded parts cannot be recovered.

Expected:
- Display the following columns in the dialog: Part Number, Part Rev, Part Description, Qty, Part Source

Expected:
- Action buttons:
- |_ Confirm & Continue: navigate to Step 3 - Quoting
- |_ Go Back: return to the current Step 2 screen

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 5.2. Click Previous button

Expected:
- Return to the previous step screen - step 1

Steps:
- 6. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 3 - Quoting

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- By default, system get value from step 2
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

Steps:
- [Optional] Update Build Qty' and Attrition Set's value

Expected:
- User may update Build Qty and Attrition Set values or leave them unchanged.

Expected:
- The updated values are applied in the next quoting steps only after the user clicks Apply.

Expected:
- If the user changes these values but does not click Apply, the changes are not saved or carried to the next steps.

Expected:
- If no changes are made, the system keeps and uses the current values for the next quoting steps.

Steps:
- 2. Select option in Primany Provider

Expected:
- - Default option: Nexar
- - Options: Nexar & Z2data
- - User can change another option

Steps:
- 2.1. Nexar

Expected:
- The system uses Nexar as the data source for quotation.

Steps:
- 2.2. Z2data

Expected:
- The system uses Z2data as the data source for quotation.

Steps:
- 3. Functional action buttons

Expected:
- The action buttons are displayed in the following order from left to right: Run Quote, Apply, Add Attrition, Apply Price Range

Expected:
- Run Quote is displayed as the primary button. Apply, Add Attrition, and Apply Price Range are displayed as secondary buttons.

Steps:
- 3.1. Run Quote

Expected:
- The system triggers the quotation process based on the selected conditions and input values.

Expected:
- The selected Primary Provider determines which data source the system uses first to retrieve quotation data.

Expected:
- If Nexar is selected as the Primary Provider, the system sends MPN values to the Nexar API first.

Expected:
- If an MPN is not found in Nexar, the system falls back to Z2Data to continue retrieving quotation data.

Expected:
- The system returns quotation results for all applicable BOM lines based on the available provider data.

Steps:
- 3.2. Apply

Expected:
- Recalculates the Total Qty for each part based on the updated Build Qty and Attrition Set values when the user clicks this button.

Expected:
- The calculation is: Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)

Steps:
- 3.3 Add Attrition

Expected:
- Display the Add Attrition dialog.

Expected:
- The following columns in the Add Attrition dialog: Actions, Part, Description, MFG, MPN, Qty, Attrition Qty, Total Qty

Expected:
- Display only part lines with Attrition = 0.

Expected:
- Do not display part lines that were marked as excluded in the previous step.

Expected:
- In the Actions column, allow user to open the Create New Attrition dialog to add attrition for the selected part.

Expected:
- After attrition is added with a value greater than 0:
- |_ The corresponding part line is removed from the Add Attrition dialog.
- |_The Attrition value is updated in the BOM line accordingly

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 3.4. Apply Price Range

Expected:
- When the user clicks Apply Price Range, the system evaluates each BOM line against the configured Attrition Info conditions.

Expected:
- If a BOM line matches a configured Price Range, the system applies the corresponding Attrition Qty to that BOM line.

Expected:
- If the quantity matches a different Price Range, the system re-evaluates and applies the Attrition Qty of the newly matched range.

Expected:
- If no condition is matched, the current Attrition value remains unchanged.

*Seach & Filter*

Steps:
- 4. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

Steps:
- 4.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 4.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 4.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 4.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 4.4. Search by Supplier

Expected:
- System shows BOM lines whose Supplier matches the entered keyword.

Steps:
- 5. Perform a filter

Expected:
- The filters are displayed from left to right in the following order: Unselected Supplier, Not Enough Qty, and Missing Attrition.

Expected:
- By default, no filter is applied, and all filter checkboxes are unchecked.

Steps:
- 5.1. Filter by Unselected Supplier

Expected:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Expected:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Expected:
- Only BOM lines with an empty or unassigned Supplier are shown in the filtered list.

Expected:
- BOM lines that already have a Supplier value are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.2. Filter by Not enough qty

Expected:
- After the user clicks Run Quote, BOM lines with insufficient quantity are displayed when Filter by Not Enough Qty is applied.

Expected:
- Only BOM lines that do not have enough available quantity to meet the required quote quantity are shown in the filtered list.

Expected:
- BOM lines with sufficient quantity are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.3. Filter by Missing Attrition

Expected:
- After the user clicks Run Quote, BOM lines without an Attrition value are displayed when Filter by Missing Attrition is applied.

Expected:
- Only BOM lines with missing or unresolved Attrition are shown in the filtered list.

Expected:
- BOM lines that already have a valid Attrition value are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 6. BoM detail format is displayed

Expected:
- BoM details are displayed with columns in order:
- |_ Part: Displays the part number or unique part identifier.
- |_ Revision: Displays the revision/version of the part.
- |_ Source: Indicates the sourcing type of the part, such as purchased or internally manufactured.
- |_ Description: Displays the part description for easy identification.
- |_ MFG: Displays the manufacturer name of the part.
- |_ MPN: Displays the manufacturer part number used for sourcing and quotation.
- |_ Qty: Displays the required quantity from the BOM.
- |_ Attrition: Displays the additional quantity added to cover expected loss or usage variation.
- |_ Total Qty: Displays the final quantity to be quoted, including BOM Qty and Attrition.
- |_ Supplier: Displays the selected or returned supplier for the part.
- |_ Order Qty: Displays the quantity that should be ordered from the supplier.
- |_ Stock: Displays the available supplier stock quantity.
- |_ LT: Displays the lead time required to obtain the part.
- |_ Pkg.: Displays the package type or packaging unit of the part.
- |_ MOQ: Displays the minimum order quantity required by the supplier.
- |_ Excess: Displays the quantity ordered beyond the required amount.
- |_ Unit Price: Displays the price per unit quoted by the supplier.
- |_ AMT: Displays the total quoted amount for the line.
- |_ Excess AMT: Displays the cost impact of the excess quantity.
- |_ Status: Displays the quotation result or supply status of the BOM line.
- |_ Notes: Displays additional remarks or quotation-related information for the BOM line.

Steps:
- 6.1. Before Run Quote

Expected:
- Auto compute attrition qty by quote line's description

Expected:
- Auto compute total qty of each quote lines with formula: Total qty = (need qty x build qty) +
- (attrition x attrition set)

Expected:
- Supplier-related, pricing-related, and availability-related information is not displayed.

Expected:
- The following columns have a red background color by default: MPN, Order Qty, Stock, LT, Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes

Expected:
- The default values are:
- |_ Order Qty = 0
- |_ MOQ = 0
- |_ Excess = 0
- |_ Excess AMT = $0.000
- |_ Status = N/A

Expected:
- The following fields are blank: Supplier, Stock, LT, Pkg., Unit Price, AMT, Notes

Steps:
- 6.2. Excluded BOM lines

Expected:
- BOM lines excluded in the previous step are displayed with a gray background color.

Expected:
- Excluded BOM lines have Status = NO BID.

Expected:
- Excluded BOM lines display only the following information: Part, Revision, Source, Description, MFG, MPN, Qty, Total Qty

Expected:
- Excluded BOM lines are not considered valid for quotation business processing.

Steps:
- 6.3. After Run Quote

Expected:
- BOM lines without a Supplier are displayed with a red background color and Status = N/A.

Expected:
- BOM lines with Not Enough Qty are displayed with a yellow background color and Status = NO.

Expected:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly

Expected:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly, and the BOM line is highlighted with a green background color.

Expected:
- If a BOM lines with a valid Supplier are displayed with status = cover

Expected:
- Supplier dropdown shows: Supplier, PKG, Stock, LT, Price Break,
- MOQ, UP, NTO, Excess, Ext, Status. Preferred suppliers shown
- first; click "view more" for non-preferred.

Expected:
- If user want to change qty, they no need to re-run, just click APPLY to let system auto compute and select supplier with new changes

Steps:
- 7. More adjustion

Expected:
- Users can manually update the values of MPN, Attrition, Supplier, Order Qty, and Notes on each BOM line.

Expected:
- When the Attrition value is changed, the system automatically recalculates the Total Qty accordingly.

Expected:
- If the user enters an Attrition value less than 0, the system automatically resets the value to 0.

Expected:
- If the user enters an Order Qty value less than 0, the system automatically resets the value to 0.

Expected:
- Any updated values are reflected correctly on the corresponding BOM line.

*Next step*

Steps:
- 7. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Expected:
- All of the action buttons have an enabled status

Steps:
- 7.1. Save draft button

Expected:
- Save Draft allows the user to save the current quotation progress at Step 3 without completing the final quotation process.

Expected:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Expected:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Expected:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Expected:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Expected:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

Steps:
- 7.2. Previous button

Expected:
- Return to the previous step screen - step 2

Steps:
- 7.3. Next button

Expected:
- Displays a confirmation dialog before proceeding.

Expected:
- The confirmation dialog contains a section listing all unselected parts that will be changed to NO BID if the user continues.

Expected:
- The confirmation dialog contains a section listing all excess parts.

Expected:
- The confirmation dialog displays the Total Excess Amount at the bottom-right of the dialog.

Expected:
- The confirmation dialog provides the following action buttons:
- |_ Back to Rework
- |_ Accept & Continue

Expected:
- If the user clicks Back to Rework, the system closes the confirmation dialog and returns the user to Step 3 - Quoting.

Expected:
- If the user clicks Accept & Continue, the system proceeds to Step 4 - Summary.

Expected:
- If the user continues, all unselected BOM lines are updated to Status = NO BID accordingly.

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 8. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains In-Progress.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 4 - Summary

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- By default, system get value from step 3
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Build Qty
- |_ Attrition Set
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Run by: Displays the user who executed the quotation process in Step 3.
- |_ Run Date: Displays the date and time when the quotation process was executed in Step 3, using the date and time format configured in the Region Language Format settings.
- |_ Run Version: Displays the quotation run version generated for that execution in Step 3. The initial run version is 1.

Steps:
- 2. Review cost summary

Expected:
- The panel includes the following fields:
- |_ Cost/Board: is calculated as the sum of the material cost per board for all quoted BOM lines.
- Calculation: (Qty1 × Unit Price1) + (Qty2 × Unit Price2) + ...
- |_ Cost/Board with Markup: is calculated by applying the markup to Cost/Board.
- Calculation: Cost/Board × (1 + Markup)
- |_ Total Cost: is calculated as the total cost of all quoted BOM lines.
- Calculation: Sum of all BOM line Amount values
- Or equivalently: (Total Qty1 × Unit Price1) + (Total Qty2 × Unit Price2) + ...
- |_ Total Cost with Markup: is calculated by applying the markup to Total Cost.
- Calculation: Total Cost × (1 + Markup)

Expected:
- All values are displayed using the configured currency format.

Expected:
- Excess Amount is highlighted in red to distinguish excess-related cost from other summary values.

Expected:
- Cost/Board, Cost/Board with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Expected:
- Total Cost, Total Cost with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Expected:
- The Add Package button is displayed below the cost summary section.

Expected:
- When quotation data is available, all summary values are calculated and displayed based on the quotation result from previous steps.

Steps:
- 3. Click Add Package button

Expected:
- The system displays the Add: Packages dialog. The dialog allows the user to add a package item into the quotation BOM list.

Expected:
- The Select Part dropdown list displays only parts that:
- belong to the same Customer as the current quotation, and are created with Part Source = Packaging.

Expected:
- Auto-filled after the user selects a part:
- |_ Description: The description of the selected part. (read-only)
- |_ MFG: The manufacturer of the selected part. (read-only)
- |_ MPN: The part numner of the selected part. (read-only)

Expected:
- Allow user add or more adjust
- |_ Select Quantity: Input the selected package quantity.
- |_ Unit Price: Input the unit price of the selected package part.
- |_ Notes: Enter additional notes for the package line.

Expected:
- Total Quantity: The total quantity of the selected package, default value is 1 when the dialog is opened (read-only)

Expected:
- Total Quantity:  After the user enters Select Quantity, this field is automatically updated accordingly.

Expected:
- Amount: The total amount of the package line.
- |_ Calculation: Unit Price × Total Quantity, is updated automatically when Unit Price or Total Quantity changes (read-onlu)

Expected:
- Action button (Add and Discard) display on top left

Expected:
- When use Add button:
- |_ Adds the selected package line into the BOM summary list and don't miss any information
- |_ The system saves the entered package information and closes the dialog.
- |_ Recalculate related summary values, including: Total Cost, Cost/Board, Total Cost with Markup, Cost/Board with Markup

Expected:
- When use Discard button: Closes the dialog without saving any changes.
- No package line is added to the BOM list.

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close: No package line is added if the user has not clicked Add.

Expected:
- Allows the user to input the unit price of the selected package part.

*Seach & Filter*

Steps:
- 4. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

Steps:
- 4.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 4.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 4.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 4.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 4.4. Search by Supplier

Expected:
- System shows BOM lines whose Supplier matches the entered keyword.

Steps:
- 5. Perform a filter

Expected:
- The filters are displayed from left to right in the following order: No bid, Not enough qty, excess qty

Expected:
- By default, no filter is applied, and all filter checkboxes are unchecked.

Steps:
- 5.1. Filter by No bid

Expected:
- When the user selects the No Bid filter, the system displays only BOM lines that do not have a selected Supplier.

Expected:
- BOM lines with a valid Supplier are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.2. Filter by Not enough qty

Expected:
- When the user selects the Not Enough Qty filter, the system displays only BOM lines with Status = NO.

Expected:
- BOM lines with other statuses are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.3. Filter by Excess qty

Expected:
- When the user selects the Excess Qty filter, the system displays only BOM lines with Excess AMT > 0.

Expected:
- BOM lines with Excess AMT = 0 are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 6. BoM detail format is displayed

Expected:
- BoM details are displayed with columns in order:
- Part, Revision, description, mfg, mpn, qty, attrition, total qty, supplier, order qty, stock, out stock, lt, pkg., moq, unit price, amount, excess qty, excess amt, status, notes

Expected:
- The user can update another valid option in the Status

Expected:
- User can add a new BOM line by using Add Package when applicable.

Expected:
- All other BOM line information is displayed as read-only.

*Next step*

Steps:
- 7. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Expected:
- All of the action buttons have an enabled status

Steps:
- 7.1. Save draft button

Expected:
- Save Draft allows the user to save the current quotation progress at Step 4 without completing the final quotation process.

Expected:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Expected:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Expected:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Expected:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Expected:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

Steps:
- 7.2. Previous button

Expected:
- Return to the previous step screen - step 3

Steps:
- 7.3. Submit button

Expected:
- If submit is successful, the system displays a success message: Add Quotation Result.

Expected:
- If submit is unsuccessful, the system displays an appropriate error message, not redirection another page

Expected:
- When the user clicks Submit, the system creates a new Quotation Result record successfully.

Expected:
- The new quotation result is added to the list in the Quotation Result tab.

Expected:
- Each Quotation Result line displays the following information:
- Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt, Total w/ Markup, Last Run By, Last Run Date, Last Run Version, BoM File

Expected:
- Last Run Version displays the corresponding assembly run number.

Expected:
- If the user runs quotation again for the same existing BOM, the Last Run Version is incremented by 1.

Expected:
- Each quotation result line allows the user to open and view the corresponding quotation detail.

Steps:
- 8. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains Quoted.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


## PR - EC - Standard Quote


### Standard Quote (Existing BOM)
- Use case: BOM is already approved and loaded in VIQ via the ECO process. PM uses the current system BOM to run a formal material cost quote.
* This use case applies only to existing customers.


### Step 1 - Config BoM


**Show quoting information**

*1. System show default quoting information get from Project Requirement*

Steps:
- By default, system get value from project requirements
- - Project Requirement: Specific project requirement information (read-only)

Steps:
- - Customer: Specific customer information, including [Customer Code] - Full Customer name (read-only)

Steps:
- - Quote Focus: Defines the primary optimization objective of the quotation, so the system and the quoting team understand the intended priority when preparing the quote.
- |_ Stock High Cost: Prioritizes immediate material availability (short lead time, low supply risk), even if the cost is higher.
- |_ Stock-Low Cost: Prioritizes lower material cost while still preferring items that are currently in stock, balancing savings with acceptable availability risk.
- |_ Production-Competitive Cost: Prioritizes the most competitive overall production cost, allowing longer lead time or broader sourcing options when needed to achieve better pricing.
- |_ Other: Allows the user to manually select suppliers; the system will not auto-select suppliers in Step 3 - Run Quote.

Steps:
- - Material Package Type: Defines the packaging logic that applies to all lines in the quotation.
- |_ Cut Tape: Unfixed package; material can be purchased in flexible quantities based on demand, without requiring full standard packaging multiples.
- |_ Reel: Reel: Fixed package; material must be purchased in multiples of the supplier’s MOQ or reel size.
- |_ $25 Reels: Applies reel-based purchasing logic using the defined $25 reel rule or threshold.
- |_ $50 Reels: Applies reel-based purchasing logic using the defined $50 reel rule or threshold.

Steps:
- - Mark Up: The markup value used in cost computation to apply margin or pricing uplift to the calculated material cost.

Steps:
- - Item Ant Quantities to Quote: The anticipated build quantities or quoting volume scenarios from project requirements. (read-only)

Steps:
- - Customer Special Need:  Any customer-specific requirements that may affect quoting, sourcing, lead time, compliance, or packaging. (read-only)

Steps:
- - Internal Notes: Internal project notes or guidance relevant to the quotation process. (read-only)

Steps:
- - Attachments: (read-only) Supporting files associated with the project requirements.
- |_ If there is more than one attachment, the system initially shows a shortened list with a View more option to expand and display all files
- |_ Clicking again changes it to View less to collapse the list.


**[Optional] Update quoting information**

*2. System allow user can change value fields: Quote Focus, Material Package Type, Markup*

Steps:
- User can update Quote Focus, Material Package Type, and Markup and values are applied in the next quoting steps


**Select quoting type**

*3. Select Action = "Load Exisiting Assembly"*

Steps:
- System will show form to allow user config BoM file want to run quote

Steps:
- Config Bom file form have 2 sections: BoM Options & Assembly Details

*4. In BoM options section
4.1. Select BoM options = "User current BoM (no changes)"
(Use when the existing BoM in the system is already correct and no update is needed before running the quote.)*

Steps:
- Uses the default template configured in Inventory Management.
- (The template selection is hidden from the user to prevent incorrect template selection.)

*4.2. Select BoM options = "Upload BoM and create a new version"
(Use when the BoM needs to be updated by uploading a new file and creating a new version before running the quote.)*

Steps:
- System display "Select template" dropdown to user chose template

Steps:
- By default, the template option configured in Inventory Management will be automatically selected.

Steps:
- Sytem display the "Upload file" button

Steps:
- Sytem display the "File name" field

*4.2.1. Select template*

Steps:
- Selected template displays full content in the field

*4.2.2. Upload file*

Steps:
- Display "Import File from Voyager" modal dialog and can It is possible to upload files from a local machine.

Steps:
- File name fields' value automated fill after upload file from local

*5. In Assembly details section
Select the "Please select assembly" field*

Steps:
- The assembly corresponding to the PR's customer will be fully listed.
- Each option also format: Customer Code - Part Number - Rev - Latest Version

Steps:
- After choosing special assembly: Display fulfill field' value with format Customer Code - Part Number - Rev - Version

Steps:
- User can clear and chose another value again in this field

*[Validation] If the user doesn't choose any option in this field*

Steps:
- After the user clicks the Next button, an error message is displayed in the bottom-right corner: "Select assembly first!"

Steps:
- The Description will be automatically populated based on the selected assembly value (and can't be more adjust)

*6. Adjust Build Quantity' value (optional)*

Steps:
- Build Quantity: The quantity of products requiring a price quote, used as the basis for calculating material requirements.
- Build Quantity' value defaults to 1, user can change another value

*[Validation] If the user adjust Build Quantity <= 0*

Steps:
- The value automatically reverts to the default value of 1.

*7. Adjust Attrition Set' value (optional)*

Steps:
- Attrition Set: The wastage allowance added to material requirements when calculating the quotation.
- Attrition Set' value defaults to 1, user can change another value

*[Validation] If the user adjust Attrition Set <= 0*

Steps:
- The value automatically reverts to the default value of 1.


**Next step**

*8. Click Next button*

Steps:
- Parses BOM from system using Indented BoM template. Proceeds to Step 2.

*9. Status Project Requirement*

Steps:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Steps:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 2 - Review BoM


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- - By default, system get value from step 1
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

*[Optional] Update Build Qty' and Attrition Set's value*

Steps:
- User can update Build Qty' and Attrition Set's value or not and values are applied in the next quoting steps

*[Validation] If the user adjust Build Quantity and Attrition Set <= 0*

Steps:
- The value automatically reverts to the default value of 1.


**Search & Filter**

*2. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG".

*2.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*2.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*2.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*2.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*3. Perform a filter*

Steps:
- The filters are displayed in the following order from left to right: Is Exclude?, Missing Manufacturer

Steps:
- Status display default status is uncheck (both 2 filters)

*3.1. Filter by Is Exclude?*

Steps:
- When the filter is selected, only BOM lines marked as excluded from quotation are displayed.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- When the user checks any of those rows, that BOM line is immediately removed from the filtered list and marked as Is Exclude.

*3.2. Filter by Missing Manufacturer*

Steps:
- When the filter is selected, only BOM lines without manufacturer data are displayed.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*4. 
4.1. BoM detail format is displayed*

Steps:
- BOM details are displayed in the format of the default template, which is configured in Inventory Management.

Steps:
- The columns Number, ROCKET_PN, Revision, Part Description, Part Source, and Quantity should be frozen, allowing users to scroll horizontally and still view the remaining columns.

Steps:
- Data from BoM file, system auto:
- Lines with the same Part Number and Revision are merged into a single line.

Steps:
- The Qty Need to Quote value is the sum of all merged line quantities.

Steps:
- This merging rule applies to parts used across multiple sub-assemblies or phantom levels.

Steps:
- The system identifies unique parts for merging based on Part Number and Revision.

Steps:
- The merging logic must work independently of the Select Column Detection value selected in Step 1.

Steps:
- If the selected template does not contain sufficient fulfill data, the system still maintains the correct merging rule based on Part Number and Revision.

*4.2. Verify checkbox selection*

Steps:
- Each BOM line displays a selection checkbox.

Steps:
- Users can check or uncheck selectable BOM lines.

Steps:
- BOM lines with Part Source = MAKE or MAKE/PHANT are automatically marked as Is Exclude and are unchecked by default, because these parts are internally manufactured rather than externally purchased, so they are not required for supplier quotation.

Steps:
- BOM lines with Qty = 0 are automatically marked as Is Exclude and are unchecked by default.

Steps:
- If Part Source has no value, the system does not auto-exclude the BOM line based on Part Source alone.

Steps:
- Users can manually re-check BOM lines with Part Source = MAKE or MAKE/PHANT if needed.

Steps:
- Clicking the header checkbox selects all rows.

Steps:
- Clicking the header checkbox again deselects all rows.

Steps:
- Checkbox states are updated correctly based on user actions and auto-exclude conditions.

Steps:
- BOM lines marked as Is Exclude are not included in the quotation process unless the user manually re-checks them.

*4.3. Verify the display of Number*

Steps:
- The NUMBER column is displayed.

Steps:
- Each BOM line shows the correct line number.

Steps:
- Line numbers are displayed in ascending sequential order.

Steps:
- The line number shown matches the corresponding BOM row.

*4.4. Verify the display of Rocket PN (Part Number)*

Steps:
- Part numbers that already exist in Part Master are displayed with a green background.

*4.5. Verify the display of Revision*

Steps:
- Displays the correct revision of a part or BOM item, helping to identify the current version of the component or record.

*4.6. Verify the display of Part description*

Steps:
- Displays the part description accurately, making it easy for users to identify the component's characteristics and name.

*4.7. Verify the display of Part source*

Steps:
- Displays the correct part source (e.g., MAKE, BUY, MAKE/PHAN, FLRSTK, MAKE/BUY, and PACKAGING), helping users understand how the part is supplied or managed.

*4.8. Verify the display of Quantity*

Steps:
- Displays the exact quantity of parts required in the BOM, facilitating material calculations and price quotations.

*4.9. Verify the display of Level*

Steps:
- Displays the correct structural level of the part within the BOM, helping to identify the component's position within the parent-child hierarchy.

*4.10. Verify the display of MFG*

Steps:
- Displays the correct part manufacturer, helping to identify the component's source of manufacture.

Steps:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.

Steps:
- The background color is displayed in yellow because the manufacturer value already exists in Manufacturer Management.

*4.11. Verify the display of MPN*

Steps:
- Displays the correct manufacturer part number, enabling accurate identification of components based on the specific manufacturer.

Steps:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.


**Next step**

*5. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Previous, Next

*5.1. Click Next button*

Steps:
- System computes TOTAL QTY = QtyPer × BuildQty +
- Attrition × AttritionSet per line.

Steps:
- Display Review Excluded Parts dialog. User review those excluded part(s) as listed. These parts will not be used to quote from Nexar and cannot be recalled
- Warning: After Run Quote in Step 3, excluded parts cannot be recovered.

Steps:
- Display the following columns in the dialog: Part Number, Part Rev, Part Description, Qty, Part Source

Steps:
- Action buttons:
- |_ Confirm & Continue: navigate to Step 3 - Quoting
- |_ Go Back: return to the current Step 2 screen

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*5.2. Click Previous button*

Steps:
- Return to the previous step screen - step 1

*6. Status Project Requirement*

Steps:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Steps:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 3 - Quoting


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 2
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

*[Optional] Update Build Qty' and Attrition Set's value*

Steps:
- User may update Build Qty and Attrition Set values or leave them unchanged.

Steps:
- The updated values are applied in the next quoting steps only after the user clicks Apply.

Steps:
- If the user changes these values but does not click Apply, the changes are not saved or carried to the next steps.

Steps:
- If no changes are made, the system keeps and uses the current values for the next quoting steps.

*2. Select option in Primany Provider*

Steps:
- - Default option: Nexar
- - Options: Nexar & Z2data
- - User can change another option

*2.1. Nexar*

Steps:
- The system uses Nexar as the data source for quotation.

*2.2. Z2data*

Steps:
- The system uses Z2data as the data source for quotation.

*3. Functional action buttons*

Steps:
- The action buttons are displayed in the following order from left to right: Run Quote, Apply, Add Attrition, Apply Price Range

Steps:
- Run Quote is displayed as the primary button. Apply, Add Attrition, and Apply Price Range are displayed as secondary buttons.

*3.1. Run Quote*

Steps:
- The system triggers the quotation process based on the selected conditions and input values.

Steps:
- The selected Primary Provider determines which data source the system uses first to retrieve quotation data.

Steps:
- If Nexar is selected as the Primary Provider, the system sends MPN values to the Nexar API first.

Steps:
- If an MPN is not found in Nexar, the system falls back to Z2Data to continue retrieving quotation data.

Steps:
- The system returns quotation results for all applicable BOM lines based on the available provider data.

*3.2. Apply*

Steps:
- Recalculates the Total Qty for each part based on the updated Build Qty and Attrition Set values when the user clicks this button.

Steps:
- The calculation is: Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)

*3.3 Add Attrition*

Steps:
- Display the Add Attrition dialog.

Steps:
- The following columns in the Add Attrition dialog: Actions, Part, Description, MFG, MPN, Qty, Attrition Qty, Total Qty

Steps:
- Display only part lines with Attrition = 0.

Steps:
- Do not display part lines that were marked as excluded in the previous step.

Steps:
- In the Actions column, allow user to open the Create New Attrition dialog to add attrition for the selected part.

Steps:
- After attrition is added with a value greater than 0:
- |_ The corresponding part line is removed from the Add Attrition dialog.
- |_The Attrition value is updated in the BOM line accordingly

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*3.4. Apply Price Range*

Steps:
- When the user clicks Apply Price Range, the system evaluates each BOM line against the configured Attrition Info conditions.

Steps:
- If a BOM line matches a configured Price Range, the system applies the corresponding Attrition Qty to that BOM line.

Steps:
- If the quantity matches a different Price Range, the system re-evaluates and applies the Attrition Qty of the newly matched range.

Steps:
- If no condition is matched, the current Attrition value remains unchanged.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: Unselected Supplier, Not Enough Qty, and Missing Attrition.

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by Unselected Supplier*

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- Only BOM lines with an empty or unassigned Supplier are shown in the filtered list.

Steps:
- BOM lines that already have a Supplier value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- After the user clicks Run Quote, BOM lines with insufficient quantity are displayed when Filter by Not Enough Qty is applied.

Steps:
- Only BOM lines that do not have enough available quantity to meet the required quote quantity are shown in the filtered list.

Steps:
- BOM lines with sufficient quantity are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Missing Attrition*

Steps:
- After the user clicks Run Quote, BOM lines without an Attrition value are displayed when Filter by Missing Attrition is applied.

Steps:
- Only BOM lines with missing or unresolved Attrition are shown in the filtered list.

Steps:
- BOM lines that already have a valid Attrition value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- |_ Part: Displays the part number or unique part identifier.
- |_ Revision: Displays the revision/version of the part.
- |_ Source: Indicates the sourcing type of the part, such as purchased or internally manufactured.
- |_ Description: Displays the part description for easy identification.
- |_ MFG: Displays the manufacturer name of the part.
- |_ MPN: Displays the manufacturer part number used for sourcing and quotation.
- |_ Qty: Displays the required quantity from the BOM.
- |_ Attrition: Displays the additional quantity added to cover expected loss or usage variation.
- |_ Total Qty: Displays the final quantity to be quoted, including BOM Qty and Attrition.
- |_ Supplier: Displays the selected or returned supplier for the part.
- |_ Order Qty: Displays the quantity that should be ordered from the supplier.
- |_ Stock: Displays the available supplier stock quantity.
- |_ LT: Displays the lead time required to obtain the part.
- |_ Pkg.: Displays the package type or packaging unit of the part.
- |_ MOQ: Displays the minimum order quantity required by the supplier.
- |_ Excess: Displays the quantity ordered beyond the required amount.
- |_ Unit Price: Displays the price per unit quoted by the supplier.
- |_ AMT: Displays the total quoted amount for the line.
- |_ Excess AMT: Displays the cost impact of the excess quantity.
- |_ Status: Displays the quotation result or supply status of the BOM line.
- |_ Notes: Displays additional remarks or quotation-related information for the BOM line.

*6.1. Before Run Quote*

Steps:
- Auto compute attrition qty by quote line's description

Steps:
- Auto compute total qty of each quote lines with formula: Total qty = (need qty x build qty) +
- (attrition x attrition set)

Steps:
- Supplier-related, pricing-related, and availability-related information is not displayed.

Steps:
- The following columns have a red background color by default: MPN, Order Qty, Stock, LT, Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes

Steps:
- The default values are:
- |_ Order Qty = 0
- |_ MOQ = 0
- |_ Excess = 0
- |_ Excess AMT = $0.000
- |_ Status = N/A

Steps:
- The following fields are blank: Supplier, Stock, LT, Pkg., Unit Price, AMT, Notes

*6.2. Excluded BOM lines*

Steps:
- BOM lines excluded in the previous step are displayed with a gray background color.

Steps:
- Excluded BOM lines have Status = NO BID.

Steps:
- Excluded BOM lines display only the following information: Part, Revision, Source, Description, MFG, MPN, Qty, Total Qty

Steps:
- Excluded BOM lines are not considered valid for quotation business processing.

*6.3. After Run Quote*

Steps:
- BOM lines without a Supplier are displayed with a red background color and Status = N/A.

Steps:
- BOM lines with Not Enough Qty are displayed with a yellow background color and Status = NO.

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly, and the BOM line is highlighted with a green background color.

Steps:
- If a BOM lines with a valid Supplier are displayed with status = cover

Steps:
- Supplier dropdown shows: Supplier, PKG, Stock, LT, Price Break,
- MOQ, UP, NTO, Excess, Ext, Status. Preferred suppliers shown
- first; click "view more" for non-preferred.

Steps:
- If user want to change qty, they no need to re-run, just click APPLY to let system auto compute and select supplier with new changes

*7. More adjustion*

Steps:
- Users can manually update the values of MPN, Attrition, Supplier, Order Qty, and Notes on each BOM line.

Steps:
- When the Attrition value is changed, the system automatically recalculates the Total Qty accordingly.

Steps:
- If the user enters an Attrition value less than 0, the system automatically resets the value to 0.

Steps:
- If the user enters an Order Qty value less than 0, the system automatically resets the value to 0.

Steps:
- Any updated values are reflected correctly on the corresponding BOM line.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 3 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 2

*7.3. Next button*

Steps:
- Displays a confirmation dialog before proceeding.

Steps:
- The confirmation dialog contains a section listing all unselected parts that will be changed to NO BID if the user continues.

Steps:
- The confirmation dialog contains a section listing all excess parts.

Steps:
- The confirmation dialog displays the Total Excess Amount at the bottom-right of the dialog.

Steps:
- The confirmation dialog provides the following action buttons:
- |_ Back to Rework
- |_ Accept & Continue

Steps:
- If the user clicks Back to Rework, the system closes the confirmation dialog and returns the user to Step 3 - Quoting.

Steps:
- If the user clicks Accept & Continue, the system proceeds to Step 4 - Summary.

Steps:
- If the user continues, all unselected BOM lines are updated to Status = NO BID accordingly.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*8. Status Project Requirement*

Steps:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains In-Progress.

Steps:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 4 - Summary


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 3
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Build Qty
- |_ Attrition Set
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Run by: Displays the user who executed the quotation process in Step 3.
- |_ Run Date: Displays the date and time when the quotation process was executed in Step 3, using the date and time format configured in the Region Language Format settings.
- |_ Run Version: Displays the quotation run version generated for that execution in Step 3. The initial run version is 1.

*2. Review cost summary*

Steps:
- The panel includes the following fields:
- |_ Cost/Board: is calculated as the sum of the material cost per board for all quoted BOM lines.
- Calculation: (Qty1 × Unit Price1) + (Qty2 × Unit Price2) + ...
- |_ Cost/Board with Markup: is calculated by applying the markup to Cost/Board.
- Calculation: Cost/Board × (1 + Markup)
- |_ Total Cost: is calculated as the total cost of all quoted BOM lines.
- Calculation: Sum of all BOM line Amount values
- Or equivalently: (Total Qty1 × Unit Price1) + (Total Qty2 × Unit Price2) + ...
- |_ Total Cost with Markup: is calculated by applying the markup to Total Cost.
- Calculation: Total Cost × (1 + Markup)

Steps:
- All values are displayed using the configured currency format.

Steps:
- Excess Amount is highlighted in red to distinguish excess-related cost from other summary values.

Steps:
- Cost/Board, Cost/Board with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- Total Cost, Total Cost with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- The Add Package button is displayed below the cost summary section.

Steps:
- When quotation data is available, all summary values are calculated and displayed based on the quotation result from previous steps.

*3. Click Add Package button*

Steps:
- The system displays the Add: Packages dialog. The dialog allows the user to add a package item into the quotation BOM list.

Steps:
- The Select Part dropdown list displays only parts that:
- belong to the same Customer as the current quotation, and are created with Part Source = Packaging.

Steps:
- Auto-filled after the user selects a part:
- |_ Description: The description of the selected part. (read-only)
- |_ MFG: The manufacturer of the selected part. (read-only)
- |_ MPN: The part numner of the selected part. (read-only)

Steps:
- Allow user add or more adjust
- |_ Select Quantity: Input the selected package quantity.
- |_ Unit Price: Input the unit price of the selected package part.
- |_ Notes: Enter additional notes for the package line.

Steps:
- Total Quantity: The total quantity of the selected package, default value is 1 when the dialog is opened (read-only)

Steps:
- Total Quantity:  After the user enters Select Quantity, this field is automatically updated accordingly.

Steps:
- Amount: The total amount of the package line.
- |_ Calculation: Unit Price × Total Quantity, is updated automatically when Unit Price or Total Quantity changes (read-onlu)

Steps:
- Action button (Add and Discard) display on top left

Steps:
- When use Add button:
- |_ Adds the selected package line into the BOM summary list and don't miss any information
- |_ The system saves the entered package information and closes the dialog.
- |_ Recalculate related summary values, including: Total Cost, Cost/Board, Total Cost with Markup, Cost/Board with Markup

Steps:
- When use Discard button: Closes the dialog without saving any changes.
- No package line is added to the BOM list.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close: No package line is added if the user has not clicked Add.

Steps:
- Allows the user to input the unit price of the selected package part.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: No bid, Not enough qty, excess qty

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by No bid*

Steps:
- When the user selects the No Bid filter, the system displays only BOM lines that do not have a selected Supplier.

Steps:
- BOM lines with a valid Supplier are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- When the user selects the Not Enough Qty filter, the system displays only BOM lines with Status = NO.

Steps:
- BOM lines with other statuses are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Excess qty*

Steps:
- When the user selects the Excess Qty filter, the system displays only BOM lines with Excess AMT > 0.

Steps:
- BOM lines with Excess AMT = 0 are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- Part, Revision, description, mfg, mpn, qty, attrition, total qty, supplier, order qty, stock, out stock, lt, pkg., moq, unit price, amount, excess qty, excess amt, status, notes

Steps:
- The user can update another valid option in the Status

Steps:
- User can add a new BOM line by using Add Package when applicable.

Steps:
- All other BOM line information is displayed as read-only.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 4 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 3

*7.3. Submit button*

Steps:
- If submit is successful, the system displays a success message: Add Quotation Result.

Steps:
- If submit is unsuccessful, the system displays an appropriate error message, not redirection another page

Steps:
- When the user clicks Submit, the system creates a new Quotation Result record successfully.

Steps:
- The new quotation result is added to the list in the Quotation Result tab.

Steps:
- Each Quotation Result line displays the following information:
- Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt, Total w/ Markup, Last Run By, Last Run Date, Last Run Version

Steps:
- Last Run Version displays the corresponding assembly run number.

Steps:
- If the user runs quotation again for the same existing BOM, the Last Run Version is incremented by 1.

Steps:
- The BOM File field is blank / has no file information when the quotation is run from an existing BOM.

Steps:
- Each quotation result line allows the user to open and view the corresponding quotation detail.

*8. Status Project Requirement*

Steps:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains Quoted.

Steps:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


## PR - EC - Resume Draft Quote


### Resume Draft Quote
- Use case:  Used when the PM needs to continue working on a previously saved draft quotation that has not been completed or submitted yet.
* This use case applies only to existing customers.


### Step 1 - Config BoM


**Review information in the Continue from drafts**

Steps:
- Pre-condition: At least one previously saved draft quotation available for the selected customer and assembly.
- Display a list of saved draf quotations in the table

Steps:
- Each draft quotation row includes the following information and read-only:
- |_ Action: Provides the Continue action that allows the user to resume the selected draft quotation.
- |_ Assembly Name: Identifies the assembly associated with the draft quotation.
- |_ Revision: Indicates the revision level of the assembly, used together with the Assembly Name to identify a specific part version.
- |_ Description: Provides a brief description of the assembly for easier identification.
- |_ Build Qty: Indicates the build quantity defined in the draft quotation.
- |_ Attrition Set: Indicates the attrition value or attrition set applied to the draft quotation.
- |_ Created Date: Indicates the date and time when the draft quotation was created.

Steps:
- In each row' action columns displays a Continue button for each draft quotation row.

*Click the Continue button*

Steps:
- Redirect to Step 3 - Quoting for the selected draft

Steps:
- The system displays the quotation data associated with the selected draft record.


### Step 3 - Quoting


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 2
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

*[Optional] Update Build Qty' and Attrition Set's value*

Steps:
- User may update Build Qty and Attrition Set values or leave them unchanged.

Steps:
- The updated values are applied in the next quoting steps only after the user clicks Apply.

Steps:
- If the user changes these values but does not click Apply, the changes are not saved or carried to the next steps.

Steps:
- If no changes are made, the system keeps and uses the current values for the next quoting steps.

*2. Select option in Primany Provider*

Steps:
- - Default option: Nexar
- - Options: Nexar & Z2data
- - User can change another option

*2.1. Nexar*

Steps:
- The system uses Nexar as the data source for quotation.

*2.2. Z2data*

Steps:
- The system uses Z2data as the data source for quotation.

*3. Functional action buttons*

Steps:
- The action buttons are displayed in the following order from left to right: Run Quote, Apply, Add Attrition, Apply Price Range

Steps:
- Run Quote is displayed as the primary button. Apply, Add Attrition, and Apply Price Range are displayed as secondary buttons.

*3.1. Run Quote*

Steps:
- The system triggers the quotation process based on the selected conditions and input values.

Steps:
- The selected Primary Provider determines which data source the system uses first to retrieve quotation data.

Steps:
- If Nexar is selected as the Primary Provider, the system sends MPN values to the Nexar API first.

Steps:
- If an MPN is not found in Nexar, the system falls back to Z2Data to continue retrieving quotation data.

Steps:
- The system returns quotation results for all applicable BOM lines based on the available provider data.

*3.2. Apply*

Steps:
- Recalculates the Total Qty for each part based on the updated Build Qty and Attrition Set values when the user clicks this button.

Steps:
- The calculation is: Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)

*3.3 Add Attrition*

Steps:
- Display the Add Attrition dialog.

Steps:
- The following columns in the Add Attrition dialog: Actions, Part, Description, MFG, MPN, Qty, Attrition Qty, Total Qty

Steps:
- Display only part lines with Attrition = 0.

Steps:
- Do not display part lines that were marked as excluded in the previous step.

Steps:
- In the Actions column, allow user to open the Create New Attrition dialog to add attrition for the selected part.

Steps:
- After attrition is added with a value greater than 0:
- |_ The corresponding part line is removed from the Add Attrition dialog.
- |_The Attrition value is updated in the BOM line accordingly

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*3.4. Apply Price Range*

Steps:
- When the user clicks Apply Price Range, the system evaluates each BOM line against the configured Attrition Info conditions.

Steps:
- If a BOM line matches a configured Price Range, the system applies the corresponding Attrition Qty to that BOM line.

Steps:
- If the quantity matches a different Price Range, the system re-evaluates and applies the Attrition Qty of the newly matched range.

Steps:
- If no condition is matched, the current Attrition value remains unchanged.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: Unselected Supplier, Not Enough Qty, and Missing Attrition.

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by Unselected Supplier*

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- Only BOM lines with an empty or unassigned Supplier are shown in the filtered list.

Steps:
- BOM lines that already have a Supplier value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- After the user clicks Run Quote, BOM lines with insufficient quantity are displayed when Filter by Not Enough Qty is applied.

Steps:
- Only BOM lines that do not have enough available quantity to meet the required quote quantity are shown in the filtered list.

Steps:
- BOM lines with sufficient quantity are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Missing Attrition*

Steps:
- After the user clicks Run Quote, BOM lines without an Attrition value are displayed when Filter by Missing Attrition is applied.

Steps:
- Only BOM lines with missing or unresolved Attrition are shown in the filtered list.

Steps:
- BOM lines that already have a valid Attrition value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- |_ Part: Displays the part number or unique part identifier.
- |_ Revision: Displays the revision/version of the part.
- |_ Source: Indicates the sourcing type of the part, such as purchased or internally manufactured.
- |_ Description: Displays the part description for easy identification.
- |_ MFG: Displays the manufacturer name of the part.
- |_ MPN: Displays the manufacturer part number used for sourcing and quotation.
- |_ Qty: Displays the required quantity from the BOM.
- |_ Attrition: Displays the additional quantity added to cover expected loss or usage variation.
- |_ Total Qty: Displays the final quantity to be quoted, including BOM Qty and Attrition.
- |_ Supplier: Displays the selected or returned supplier for the part.
- |_ Order Qty: Displays the quantity that should be ordered from the supplier.
- |_ Stock: Displays the available supplier stock quantity.
- |_ LT: Displays the lead time required to obtain the part.
- |_ Pkg.: Displays the package type or packaging unit of the part.
- |_ MOQ: Displays the minimum order quantity required by the supplier.
- |_ Excess: Displays the quantity ordered beyond the required amount.
- |_ Unit Price: Displays the price per unit quoted by the supplier.
- |_ AMT: Displays the total quoted amount for the line.
- |_ Excess AMT: Displays the cost impact of the excess quantity.
- |_ Status: Displays the quotation result or supply status of the BOM line.
- |_ Notes: Displays additional remarks or quotation-related information for the BOM line.

*6.1. Before Run Quote*

Steps:
- Auto compute attrition qty by quote line's description

Steps:
- Auto compute total qty of each quote lines with formula: Total qty = (need qty x build qty) +
- (attrition x attrition set)

Steps:
- Supplier-related, pricing-related, and availability-related information is not displayed.

Steps:
- The following columns have a red background color by default: MPN, Order Qty, Stock, LT, Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes

Steps:
- The default values are:
- |_ Order Qty = 0
- |_ MOQ = 0
- |_ Excess = 0
- |_ Excess AMT = $0.000
- |_ Status = N/A

Steps:
- The following fields are blank: Supplier, Stock, LT, Pkg., Unit Price, AMT, Notes

*6.2. Excluded BOM lines*

Steps:
- BOM lines excluded in the previous step are displayed with a gray background color.

Steps:
- Excluded BOM lines have Status = NO BID.

Steps:
- Excluded BOM lines display only the following information: Part, Revision, Source, Description, MFG, MPN, Qty, Total Qty

Steps:
- Excluded BOM lines are not considered valid for quotation business processing.

*6.3. After Run Quote*

Steps:
- BOM lines without a Supplier are displayed with a red background color and Status = N/A.

Steps:
- BOM lines with Not Enough Qty are displayed with a yellow background color and Status = NO.

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly, and the BOM line is highlighted with a green background color.

Steps:
- If a BOM lines with a valid Supplier are displayed with status = cover

Steps:
- Supplier dropdown shows: Supplier, PKG, Stock, LT, Price Break,
- MOQ, UP, NTO, Excess, Ext, Status. Preferred suppliers shown
- first; click "view more" for non-preferred.

Steps:
- If user want to change qty, they no need to re-run, just click APPLY to let system auto compute and select supplier with new changes

*7. More adjustion*

Steps:
- Users can manually update the values of MPN, Attrition, Supplier, Order Qty, and Notes on each BOM line.

Steps:
- When the Attrition value is changed, the system automatically recalculates the Total Qty accordingly.

Steps:
- If the user enters an Attrition value less than 0, the system automatically resets the value to 0.

Steps:
- If the user enters an Order Qty value less than 0, the system automatically resets the value to 0.

Steps:
- Any updated values are reflected correctly on the corresponding BOM line.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 3 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 2

*7.3. Next button*

Steps:
- Displays a confirmation dialog before proceeding.

Steps:
- The confirmation dialog contains a section listing all unselected parts that will be changed to NO BID if the user continues.

Steps:
- The confirmation dialog contains a section listing all excess parts.

Steps:
- The confirmation dialog displays the Total Excess Amount at the bottom-right of the dialog.

Steps:
- The confirmation dialog provides the following action buttons:
- |_ Back to Rework
- |_ Accept & Continue

Steps:
- If the user clicks Back to Rework, the system closes the confirmation dialog and returns the user to Step 3 - Quoting.

Steps:
- If the user clicks Accept & Continue, the system proceeds to Step 4 - Summary.

Steps:
- If the user continues, all unselected BOM lines are updated to Status = NO BID accordingly.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close


### Step 4 - Summary


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 3
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Build Qty
- |_ Attrition Set
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Run by: Displays the user who executed the quotation process in Step 3.
- |_ Run Date: Displays the date and time when the quotation process was executed in Step 3, using the date and time format configured in the Region Language Format settings.
- |_ Run Version: Displays the quotation run version generated for that execution in Step 3. The initial run version is 1.

*2. Review cost summary*

Steps:
- The panel includes the following fields:
- |_ Cost/Board: is calculated as the sum of the material cost per board for all quoted BOM lines.
- Calculation: (Qty1 × Unit Price1) + (Qty2 × Unit Price2) + ...
- |_ Cost/Board with Markup: is calculated by applying the markup to Cost/Board.
- Calculation: Cost/Board × (1 + Markup)
- |_ Total Cost: is calculated as the total cost of all quoted BOM lines.
- Calculation: Sum of all BOM line Amount values
- Or equivalently: (Total Qty1 × Unit Price1) + (Total Qty2 × Unit Price2) + ...
- |_ Total Cost with Markup: is calculated by applying the markup to Total Cost.
- Calculation: Total Cost × (1 + Markup)

Steps:
- All values are displayed using the configured currency format.

Steps:
- Excess Amount is highlighted in red to distinguish excess-related cost from other summary values.

Steps:
- Cost/Board, Cost/Board with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- Total Cost, Total Cost with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- The Add Package button is displayed below the cost summary section.

Steps:
- When quotation data is available, all summary values are calculated and displayed based on the quotation result from previous steps.

*3. Click Add Package button*

Steps:
- The system displays the Add: Packages dialog. The dialog allows the user to add a package item into the quotation BOM list.

Steps:
- The Select Part dropdown list displays only parts that:
- belong to the same Customer as the current quotation, and are created with Part Source = Packaging.

Steps:
- Auto-filled after the user selects a part:
- |_ Description: The description of the selected part. (read-only)
- |_ MFG: The manufacturer of the selected part. (read-only)
- |_ MPN: The part numner of the selected part. (read-only)

Steps:
- Allow user add or more adjust
- |_ Select Quantity: Input the selected package quantity.
- |_ Unit Price: Input the unit price of the selected package part.
- |_ Notes: Enter additional notes for the package line.

Steps:
- Total Quantity: The total quantity of the selected package, default value is 1 when the dialog is opened (read-only)

Steps:
- Total Quantity:  After the user enters Select Quantity, this field is automatically updated accordingly.

Steps:
- Amount: The total amount of the package line.
- |_ Calculation: Unit Price × Total Quantity, is updated automatically when Unit Price or Total Quantity changes (read-onlu)

Steps:
- Action button (Add and Discard) display on top left

Steps:
- When use Add button:
- |_ Adds the selected package line into the BOM summary list and don't miss any information
- |_ The system saves the entered package information and closes the dialog.
- |_ Recalculate related summary values, including: Total Cost, Cost/Board, Total Cost with Markup, Cost/Board with Markup

Steps:
- When use Discard button: Closes the dialog without saving any changes.
- No package line is added to the BOM list.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close: No package line is added if the user has not clicked Add.

Steps:
- Allows the user to input the unit price of the selected package part.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: No bid, Not enough qty, excess qty

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by No bid*

Steps:
- When the user selects the No Bid filter, the system displays only BOM lines that do not have a selected Supplier.

Steps:
- BOM lines with a valid Supplier are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- When the user selects the Not Enough Qty filter, the system displays only BOM lines with Status = NO.

Steps:
- BOM lines with other statuses are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Excess qty*

Steps:
- When the user selects the Excess Qty filter, the system displays only BOM lines with Excess AMT > 0.

Steps:
- BOM lines with Excess AMT = 0 are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- Part, Revision, description, mfg, mpn, qty, attrition, total qty, supplier, order qty, stock, out stock, lt, pkg., moq, unit price, amount, excess qty, excess amt, status, notes

Steps:
- The user can update another valid option in the Status

Steps:
- User can add a new BOM line by using Add Package when applicable.

Steps:
- All other BOM line information is displayed as read-only.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 4 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 3

*7.3. Submit button*

Steps:
- If submit is successful, the system displays a success message: Add Quotation Result.

Steps:
- If submit is unsuccessful, the system displays an appropriate error message, not redirection another page

Steps:
- When the user clicks Submit, the system creates a new Quotation Result record successfully.

Steps:
- The new quotation result is added to the list in the Quotation Result tab.

Steps:
- Each Quotation Result line displays the following information:
- Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt, Total w/ Markup, Last Run By, Last Run Date, Last Run Version

Steps:
- Last Run Version displays the corresponding assembly run number.

Steps:
- If the user runs quotation again for the same existing BOM, the Last Run Version is incremented by 1.

Steps:
- The BOM File field is blank / has no file information when the quotation is run from an existing BOM.

Steps:
- Each quotation result line allows the user to open and view the corresponding quotation detail.


## PR - NC - Create PR


### Create the new RFQ (Project Requirement)
- Use case: Used when a new customer quotation request is received and the PM needs to create a new RFQ to capture the initial project and customer information as the starting point for the quotation process.
* This use case applies only to new customers.

*Create the new RFQ*

Steps:
- 1. Click the Add New button

Expected:
- Display the New Project Requirement modal

Expected:
- Allow user enter or select information in required and optional fields

Expected:
- In this mode, only the Save button is displayed and it is disabled by default.

Expected:
- After the user enters or selects values for all required fields, the Save button becomes enabled.

Expected:
- The system automatically generates and displays the No. as the H1 header for a newly created Project Requirement, using the next sequential RFQ number.

Steps:
- 2.Enter or select required and optional fields
- 2.1. General information section

Expected:
- General information: This section captures the basic customer, project, and quotation details required to create and manage the RFQ.
- It provides the foundational information used throughout the quotation process.

Steps:
- |_ New Customer? (check)

Expected:
- - New Customer?: Indicates whether the RFQ is created for a new customer not yet available in the system.
- By default, this checkbox is not checked.

Expected:
- When checked, the Customer field is displayed as a text field for manual entry.

Steps:
- |_ Customer

Expected:
- - Customer: Identifies the customer associated with the RFQ.
- Displays as a text field that allows users to enter text.

Steps:
- |_ Customer Contact

Expected:
- - Customer Contact: Specifies the contact person representing the customer for this RFQ.
- This field will be supported by a new feature for entering customer contact information

Steps:
- |_ Project Name

Expected:
- - Project Name: Specifies the name of the project related to the RFQ for identification and tracking purposes
- Allows the user to enter the project name

Steps:
- |_ ITAR

Expected:
- - ITAR: Indicates whether the project is subject to ITAR compliance requirements.
- If the RFQ is marked as ITAR = true, only users whose account has ITAR = true can access and view it.

Expected:
- Users whose account has ITAR = true can view all RFQs, including those with ITAR = true and ITAR = false.

Expected:
- Users whose account has ITAR = false can view only RFQs with ITAR = false.

Steps:
- |_ Project Type

Expected:
- - Project Type: Specifies the type of project for the RFQ. It is used to classify the RFQ based on the project’s nature and may affect related workflow, checklist, or assignment setup.
- Allows the user to select the appropriate project type for the RFQ.

Expected:
- Available options:
- |_ NPI - Validation Production: Used for new product introduction projects in the validation production stage.
- |_ Production Box Build: Used for box build projects in mass or standard production.
- |_ One Time Build: Used for projects that are built only once for a specific need.
- |_ Reference Design: Used for projects based on a reference design provided as a baseline.
- |_ Test Development - Low Vol: Used for test development projects with low production volume.
- |_ Test Development - High Vol: Used for test development projects with high production volume

Expected:
- If the selected value is NPI - Validation Production, Production, Box Build, or Test Development - High Vol, the Checklist & Assignment tab displays an additional Engineering Checklists panel.

Steps:
- |_ Order Type

Expected:
- - Order Type: Specifies the order category of the RFQ and indicates whether the request is a new order, a repeat order, or a revision change.
- Allows the user to select the appropriate order type for the RFQ.

Expected:
- Available options:
- |_ New: Used when the RFQ is created for a new order that has not been quoted or processed before.
- |_ Repeat: Used when the RFQ is created for an order that has been previously quoted or processed and is being requested again.
- |_ Rev Change: Used when the RFQ is created for a revision change to an existing order or quotation.

Expected:
- If selected value is Repeat, the Historical RFQ field is displayed below
- Allowing the user to select an existing RFQ associated with the selected customer in order to copy basic information from that RFQ and reduce re-entry effort.

Steps:
- |_ Historical RFQ

Expected:
- - Historical RFQ: Used to copy basic information from the selected RFQ to reduce re-entry effort.
- Precondition: Displays when selected Order Type is Repeat

Steps:
- |_ Customer Type

Expected:
- - Customer Type: Specifies the customer supply model for the RFQ, used to define how materials or components are supplied and managed for the project.
- Allows the user to select the appropriate customer type for the RFQ

Expected:
- Available options:
- |_ Consigned: The customer provides the required materials or components.
- |_ Managed Consigned: The customer provides the materials or components, but they are managed by the company.
- |_ Mixed: Materials or components are supplied by both the customer and the company.
- |_ Turnkey: The company is fully responsible for providing and managing all materials or components.

Steps:
- |_ Due Date

Expected:
- - Due Date: Specifies the expected due date of the RFQ, used to indicate the target date for quotation completion or submission.
- Allows the user to enter or select the due date for the RFQ.

Expected:
- Displays the placeholder in month/day/year format by default.

Expected:
- Accepts the date in MM/DD/YYYY format

Steps:
- |_ Assigneed To

Expected:
- - Assigneed To: Specifies the user responsible for handling the RFQ
- Allows the user to select a different assignee

Expected:
- The default value is the currently logged-in user.

Expected:
- Only one assignee can be selected.

Expected:
- After the RFQ is created successfully, an email notification is sent to the assigned user.

Steps:
- |_ Created Date

Expected:
- - Created Date: Used to record the RFQ creation timestamp for tracking, audit, and reference purposes.
- Displays the date and time when the RFQ was created

Expected:
- The value is automatically populated by the system and is read-only.

Expected:
- Displays in MM/DD/YYYY HH:MM:SS format.

Steps:
- |_ Priority

Expected:
- - Priority: Used to indicate the urgency or importance of the RFQ and help prioritize handling and follow-up.
- Allows the user to set the RFQ priority using a rating input.

Expected:
- Displays a tooltip on hover corresponding to the selected level: Low, Medium, or High.

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Customer, Project Name, Order Type, Customer Type, Due Date, Assigned To, and Priority.
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Steps:
- [Validation] - UI

Expected:
- A red asterisk (*) is displayed next to each required field label.

Steps:
- 2.2. Specific Requirements tab

Expected:
- This tab is used to capture detailed requirements and supporting information for the RFQ.
- It helps define the quote configuration, technical specifications, special requirements, and additional notes that should be considered during quotation preparation and review.

Expected:
- The section is organized into the following areas:
- |_ Quote Configuration: Defines the main quotation setup and business focus.
- |_ Technical Specifications: Captures the technical requirements of the RFQ.
- |_ Special Requirements & Options: Records special conditions or optional requirements.
- |_ Additional Notes: Provides additional information or clarification.

Steps:
- |_ Quote Configuration > Quote Focus

Expected:
- - Quote Focus: Specifies the quotation focus or business objective for the RFQ, used to identify the pricing or supply strategy applied to the quote.
- Allows the user to select the appropriate quote focus for the RFQ.

Expected:
- Available options:
- |_ Production - Competitive Cost: Used when the quotation is focused on supporting production demand with a competitive cost target.
- |_ Stock - High Cost: Used when the quotation is prepared for stock supply and a higher cost scenario is acceptable or expected.
- |_ Stock - Low Cost: Used when the quotation is prepared for stock supply with emphasis on lower cost.
- |_ OTHER: Used when the quotation focus does not fall under the predefined options.

Steps:
- |_ Quote Configuration > Material Package Type

Expected:
- - Material Package Type:  Specifies the packaging type of the materials requested for the RFQ, used to indicate how the materials should be supplied or packaged for quotation purposes.
- Allows the user to select the material packaging type for the RFQ.

Expected:
- Available options
- |_ Cut Tape: Materials are supplied in cut tape form, typically in smaller quantities.
- |_ Reels: Materials are supplied in full reel packaging.
- |_ $50 Reels: Materials are supplied in reel packaging with a reel charge of $50.
- |_ $25 Reels: Materials are supplied in reel packaging with a reel charge of $25.

Steps:
- |_ Quote Configuration > Markup

Expected:
- - Markup: Specifies the markup value applied to the quotation.
- Allows the user to enter a numeric value greater than or equal to 0.

Expected:
- If the entered value is less than 0, an error message is displayed below the field in red text: "Number must not be negative."

Steps:
- |_ Quote Configuration > Acceptable LeadTime In Day

Expected:
- - Acceptable LeadTime In Day:  Specifies the maximum acceptable lead time for the RFQ in days, used to indicate the expected delivery timeline that is acceptable for quotation consideration.
- Allows the user to enter a numeric value greater than or equal to 0

Expected:
- If the entered value is less than 0, an error message is displayed below the field in red text: "Number must not be negative."

Steps:
- |_ Quote Configuration > Item Ant Quantities To Quote

Expected:
- - Item Ant Quantities To Quote: Specifies the items and corresponding quantities to be included in the quotation, used to provide the detailed product and quantity information required for quote preparation.
- Allows the user to enter both text and numeric values.

Steps:
- |_ Technical specifications > Build Requirement

Expected:
- - Build Requirement:  Defines the production scope required for the RFQ, used to identify what level of assembly or build should be quoted.
- Allows the user to select the applicable build requirement.

Expected:
- Available options
- |_ System: Used when the quotation applies to a complete system build.
- |_ PCBA: Used when the quotation applies to printed circuit board assembly only.
- |_ PCBA + System: Used when the quotation applies to both PCBA and full system build.
- |_ Sub-assy Box Build: Used when the quotation applies to a sub-assembly box build.
- |_ Sub-assy PCBA: Used when the quotation applies to a sub-assembly PCBA build.

Steps:
- |_ Technical specifications > Test Requirements

Expected:
- - Test Requirements: Defines the testing scope required for the RFQ, used to identify what testing process should be included in the quotation.
- Allows the user to select the applicable test requirement.

Expected:
- Available options
- |_ Burn-in: Used when burn-in testing is required.
- |_ Functional: Used when functional testing is required.
- |_ Flying Probe: Used when flying probe testing is required.
- |_ ICT/ESS: Used when ICT or ESS testing is required.
- |_ N/A: Used when no test requirement applies.

Steps:
- |_ Technical specifications > Assembly Turn Time

Expected:
- - Assembly Turn Time: Specifies the expected assembly turnaround time for the RFQ, used to indicate the required time frame for completing the assembly process.
- Allows the user to enter both text and numeric values."

Steps:
- |_ Technical specifications > Excess and MOQ

Expected:
- - Excess and MOQ: Indicates how excess quantity and minimum order quantity should be considered in the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ None: No special consideration for excess quantity or MOQ.
- |_ Low: Low excess quantity or MOQ is acceptable.
- |_ OK: Excess quantity or MOQ is acceptable.

Steps:
- |_ Technical specifications > Net Consigned Inventory

Expected:
- - Net Consigned Inventory: Indicates whether net consigned inventory is provided for the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ No: No net consigned inventory is provided.
- |_ Yes-No Charge: Net consigned inventory is provided at no additional charge.

Steps:
- |_ Technical specifications > Rocket Consigned Inventory

Expected:
- - Rocket Consigned Inventory: Indicates whether rocket consigned inventory is provided for the RFQ.
- Allows the user to check one option.

Expected:
- Available options:
- |_ None: No rocket consigned inventory is provided.
- |_ Yes - No Charge: Rocket consigned inventory is provided at no additional charge.
- |_ Yes - Charge: Rocket consigned inventory is provided with additional charge.

Steps:
- |_ Special Requirements & options

Expected:
- - Special Requirements & option: Used to capture special conditions or optional requirements that should be considered in the quotation.
- Allows the user to select one or more applicable options.

Expected:
- Available options:
- |_ Conformal Coating: Indicates that conformal coating is required.
- |_ Provide Alt AML For Out Stock: Indicates that an alternate approved manufacturer list should be provided for out-of-stock materials.
- |_ Broker: Indicates that broker sourcing is allowed or required for material supply.

Steps:
- |_ Additional notes > Customer specific needs

Expected:
- - Customer specific needs: Used to capture customer-specific requirements, requests, or notes related to the RFQ.
- Allows the user to enter and format content in the editor section.

Steps:
- |_ Additional notes > Internal notes

Expected:
- - Internal notes: Used to capture internal comments, notes, or additional information for reference during RFQ handling.
- Allows the user to enter and format content in the editor section.

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Quote Focus, Material Package Type, Markup, Acceptable LeadTime In Day, Item Ant Quantities To Quote, Build Requirement, Test Requirements, Excess and MOQ, Net Consigned Inventory, Rocket Consigned Inventory
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Steps:
- 2.3. Checklist & Assignment tab

Expected:
- Checklist & Assignment: Used to assign related roles and manage checklist items for the RFQ, helps track required documents, tasks, and responsible users during the quotation process.

Expected:
- The tab is organized into the following areas:
- |_ Assignee: Used to assign responsible users to specific roles involved in RFQ handling, such as Program Manager, Buyer, and Engineer.
- |_ Program checklist: Used to record and track program-related checklist items that must be completed or reviewed during the quotation process.
- |_ Engineering checklist: Used to record and track engineering-related checklist items that must be completed or reviewed during the quotation process.
- (This panel is displayed only when the selected Project Type is one of the following: NPI - Validation Production, Production, Box Build, or Test Development - High Vol.)
- |_ Attached Documents table: Used to display and manage documents attached to the selected assignment or RFQ, including document details, assignee, upload information, and status.

Steps:
- |_ Assignee > Program Manager

Expected:
- - Program Manager: Used to assign the Program Manager responsible for coordinating and managing the RFQ process.
- Helps identify the primary person in charge of program-related follow-up, communication, and document handling.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Program Manager has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Program Manager to another active user.

Steps:
- |_ Assignee > Buyer

Expected:
- - Buyer: Used to assign the Buyer responsible for purchasing-related activities in the RFQ process.
- Helps identify the person in charge of material sourcing, pricing, and supplier coordination.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Buyer has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Buyer to another active user.

Steps:
- |_ Assignee > Engineer

Expected:
- - Engineer: Used to assign the Engineer responsible for technical review and engineering-related activities in the RFQ process.
- Helps identify the person in charge of technical evaluation, requirement review, and engineering support.
- - In this selector: a list of all user accounts and allows the user to assign one active user.

Expected:
- If a Engineer has been configured for the corresponding customer in Sales Management > Customer Management, that user is displayed as the default selected value.

Expected:
- The user can change the selected Engineer to another active user.

Steps:
- |_ Program Checklists panel

Expected:
- - Program Checklits: Used to display and manage the checklist items required for the Program Manager during the RFQ process, helps ensure that all program-related tasks, documents, or review items are identified and tracked.
- Allows the user to check completed or applicable checklist items.

Expected:
- Display the The checklist options are configured in Sales Management > Configuration > General Settings > Program Manager Checklist.

Expected:
- The system displays checklist items dynamically based on that configuration.
- If there are how many rows configured in Program Manager Checklist, there will be the same number of checklist rows displayed in the Program Checklists panel for selection.

Expected:
- When the user checks any checklist item in this panel, the Attached Documents table displays one additional row with the corresponding information.

Steps:
- |_ Engineering Checklists panel

Expected:
- Pre-condition: This panel is displayed only when the selected Project Type is one of the following: NPI - Validation Production, Production, Box Build, or Test Development - High Vol.

Expected:
- - Engineering Checklists: Used to display and manage engineering-related checklist items required during the RFQ process, helps ensure that technical review tasks, engineering validations, or required engineering documents are identified and tracked.
- Allows the user to check completed or applicable checklist items.

Expected:
- Display the The checklist options are configured in Sales Management > Configuration > General Settings > Engineer Checklist

Expected:
- The system displays checklist items dynamically based on that configuration.
- If there are how many rows configured in Engineer Checklist, there will be the same number of checklist rows displayed in the Engineer Checklist panel for selection.

Expected:
- When the user checks any checklist item in this panel, the Attached Documents table displays one additional row with the corresponding information.

Steps:
- |_ Attached Documents table:

Expected:
- - Attached Documents table:  Used to display and manage document items corresponding to the selected checklist entries, helping track document submission, assignment, upload information, completion status, and follow-up actions for each required document during the RFQ process.

Expected:
- The Attached Documents table includes the following columns in order:
- |_ Type
- |_ Document Name
- |_ Uploaded By
- |_ Uploaded Date
- |_ Assignee
- |_ Status
- |_ Actions

Expected:
- The Type column displays the checklist name corresponding to the selected item.

Expected:
- The Document Name column displays the name of the attached document, if available.

Expected:
- After a file is uploaded, the user can download the uploaded file from the corresponding checklist row.

Expected:
- After a file is uploaded, the user can remove the uploaded file from the corresponding checklist row.

Expected:
- The Uploaded By column displays the user who uploaded the document (after completed create the RFQ), if available.

Expected:
- The Uploaded Date column displays the date when the document was uploaded (after completed create the RFQ), if available.

Expected:
- The Assignee column allows the user to assign the responsible user for that document item.
- |_ If the checklist item belongs to Program Checklists, the default assignee is the selected Program Manager, and the user can change it to another user.
- |_ If the checklist item belongs to Engineering Checklists, the default assignee is the selected Engineer, and the user can change it to another user.

Expected:
- The Status column displays the current document status.
- |_ The default status is To do, displayed with a red label.
- |_ The status is In Progress, displayed with a cyan label, when a file has been uploaded but has not yet been approved.
- |_ The status is Completed, displayed with a green label, when a file has been uploaded and approved.

Expected:
- The Actions column provides available actions for document handling, including action buttons in the following order: Upload and Approve.
- |_ If a checklist row exists but no file has been attached, the Upload button is enabled and the Approve button is disabled.
- |_ If a checklist row exists and a file has been attached (after saving RFQ), both the Upload button and the Approve button are enabled.
- |_ If a checklist row exists, a file has been attached, and the document has been approved, both the Upload button and the Approve button are disabled.

Expected:
- If no checklist item is selected, the table displays no corresponding document rows.

Expected:
- When a checklist item is selected, a corresponding row is added to the table.

Expected:
- When a checklist item is unselected, the corresponding row is removed from the table.

Steps:
- [Validation] - UI

Expected:
- Required fields are marked with a red asterisk (*) on the right side:
- - In general information: Customer, Project Name, Order Type, Customer Type, Due Date, Assigned To, Priority
- - Specific Requirement: Quote Focus, Material Package Type, Markup, Acceptable LeadTime In Day, Item Ant Quantities To Quote, Build Requirement, Test Requirements, Excess and MOQ, Net Consigned Inventory, Rocket Consigned Inventory
- - Checklists & Assignment: Program Manager, Buyer

Steps:
- [Validation] - If the user doesn't choose or enter any option in required fields and click outside

Expected:
- Required fields: Program Manager, Buyer
- If any required field is left empty, an error message is displayed below the field in red text: "This field is required."

Steps:
- 2.4. Activity Logs tab:

Steps:
- 3. Click the Save button

Expected:
- The Save button is enabled only when all required fields have been selected and entered.

Expected:
- The Save button remains disabled if any required field has not been selected or entered.

Expected:
- After the RFQ is created successfully, the screen is displayed in view mode

Expected:
- After the RFQ is created successfully, allowing the user to review all information entered during RFQ creation

Expected:
- After the RFQ is created successfully, the system sets the RFQ status to New.

Expected:
- After the RFQ is created successfully, the system displays the following buttons in order: Edit, BOM Comparison, Run Quotation, and Cancel.

Expected:
- After the RFQ is created successfully, the system sends a notification email about the successful creation of the new RFQ to the users assigned in the Program Manager and Engineering checklist sections.

Expected:
- If the same user is assigned to both the Program Manager and Engineer roles, the system sends only one email to that user.

Expected:
- After the RFQ is created successfully, the system displays an additional Add Contact button below the Customer field.

Expected:
- After the RFQ is created successfully, the system displays an additional New Customer status at the top-right corner of the RFQ screen

Expected:
- Allow user to use modal window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 4. Click the Add Contact button

Expected:
- When the user clicks the Add Contact button, the system displays the Create New Customer modal and allows the user to add one or more contacts for that new customer in the Contact tab.

Expected:
- After the contacts are added successfully, all contacts belonging to that customer are listed in the Customer Contact dropdown on the Project Requirement Details screen.


## PR - NC - Quick Quote


### Quick Quote (New BOM)
- Use case: Used when a new customer quotation request is received. PM creates a new RFQ as the starting point for preparing the quote.
* This use case applies only to new customers.


### Step 1 - Config BoM

*Show quoting information*

Steps:
- 1. System show default quoting information get from Project Requirement

Expected:
- By default, system get value from project requirements
- - Customer: Specific customer information, including [Customer Code] - Full Customer name

Expected:
- - Quote Focus: Primary optimization goal for the quote.
- |_ Stock High Cost: highest-cost in-stock option; favors authorized/traceable suppliers
- |_ Stock-Low Cost: cheapest in-stock option
- |_ Production-Competitive Cost: best future production price; full-package offers only, shortest lead time first
- |_ Other: no auto-selection; buyer chooses supplier manually

Expected:
- - Material Package Type: The packaging logic that applies to all lines in the quotation.
- |_ Cut Tape: Unfixed package; material can be purchased in flexible quantities based on demand, without requiring full standard packaging multiples.
- |_ Reel: Fixed package; material must be purchased in multiples of the supplier’s MOQ or reel size.
- |_ $25 Reels: Applies reel-based purchasing logic using the defined $25 reel rule or threshold.
- |_ $50 Reels: Applies reel-based purchasing logic using the defined $50 reel rule or threshold.

Expected:
- - Mark up: Markup value used in cost computation to apply margin or pricing uplift to the calculated material cost.

Expected:
- - Item Ant Quantities to Quote: The anticipated build quantities or quoting volume scenarios from project requirements.

Expected:
- - Customer Special Need:  Any customer-specific requirements that may affect quoting, sourcing, lead time, compliance, or packaging.

Expected:
- - Internal Notes: Internal project notes or guidance relevant to the quotation process.

Expected:
- - Attachments: Supporting files associated with the project requirements.
- |_ User can view less or more files by clicking on "View More

*[Optional] Update quoting information*

Steps:
- 2. System allow user can change value fields: Quote Focus, Material Package Type, Markup

Expected:
- User can update Quote Focus, Material Package Type, and Markup and values are applied in the next quoting steps

*Select quoting type*

Steps:
- 3. Select Action = "Import New BoM"

Expected:
- Precondition: Only show this option when user attach at least 1 file in this corresponding project requirements

Expected:
- System will show form to allow user config BoM file want to run quote

Expected:
- Config Bom file form have 2 sections: BoM Options & Assembly Details

Steps:
- 4. In BoM options section

Expected:
- Uses the default template configured in Inventory Management.
- (The template selection is hidden from the user to prevent incorrect template selection.)

Steps:
- 4.1. Please select an attachment you would like to process

Expected:
- This field allows the user to select the uploaded BoM file that will be used for the quoting process.

Expected:
- The selectable file source comes from the Attachments list in the current Project Requirement.

Expected:
- The system accepts only .xlsx files for selection.

Expected:
- If there is only 1 valid attachment, the system automatically selects that file in this step.

Expected:
- If there are multiple uploaded BoM files in the current Project Requirement, the user must select which file will be used to run the quote.

Steps:
- 4.2. File Name

Expected:
- The File Name field displays the name of the selected attachment.

Expected:
- This field is automatically populated after the user selects a file.

Expected:
- This field is read-only.

Steps:
- 4.3. Select template

Expected:
- This field allows the user to select an existing BoM template to map and validate the uploaded BoM file.

Expected:
- The selected template is used to ensure the uploaded file contains the required columns: Qty, MFG, MPN

Expected:
- The system uses the selected template to validate whether the uploaded BoM file structure matches the expected format.

Expected:
- If the user selects the wrong template for the uploaded BoM file, and the system cannot detect the required header values (Qty, MFG, MPN) from the uploaded file based on that template:
- |_ the system displays an error message,
- |_ and prevents navigation to Step 2.

Steps:
- 4.4. Select Column Detection

Expected:
- This field defines which column will be used as the unique identifier when the system detects and matches parts across records.

Expected:
- The selected value is typically: part number, rev, part source, qty per, mfg, mfgpn, level, description

Expected:
- The system uses this selected column to distinguish quote lines correctly.

Expected:
- If the user selects part_number or description, but the selected field has no value in the uploaded file, the system cannot detect records correctly.

Expected:
- In such case, the system may incorrectly merge multiple quote lines into a single line.

Steps:
- 4.5. Don't see your template?

Expected:
- This option allows the user to create a new BoM template by customer when no suitable existing template is available.

Expected:
- This option is used when the user cannot find a matching template for the uploaded BoM file.

Expected:
- The option should be enabled when no Select Template value has been chosen.

Expected:
- The option should be disabled after the user has selected a template in Select Template.

Expected:
- When used successfully, the user can create a new customer-specific BoM template for future use.

Steps:
- 5. In Assembly details section
- 5.1. Enter the "Assembly Part Number" field

Expected:
- - Assembly Part Number: Used to specify the customer's assembly part number for the RFQ item.
- This field is used together with the Revision field to identify a unique part.

Expected:
- Allow the users enter input is letters or numbers

Expected:
- After the user enters a value and clicks outside the field, the system automatically prefixes the entered value with the customer code in the format: 0CustomerCode-Part Number (for example: 0455-3032606)

Steps:
- 5.2. Enter the "Revision" field

Expected:
- - Revision: Used to specify the revision level of the assembly part number.
- This field is used together with the Assembly Part Number to identify and distinguish a unique part version.

Expected:
- Allow the users enter input is letters or numbers

Steps:
- 5.3. Enter the "Description" field

Expected:
- - Description: Used to provide a brief description of the assembly item.
- This field helps users identify and understand the part more clearly during RFQ review and processing.

Expected:
- Allow the users enter input is letters or numbers

Steps:
- 6. Adjust Build Quantity' value (optional)

Expected:
- Build Quantity: The quantity of products requiring a price quote, used as the basis for calculating material requirements.
- Build Quantity' value defaults to 1, user can change another value

Steps:
- [Validation] If the user adjust Build Quantity <= 0

Expected:
- The value automatically reverts to the default value of 1.

Steps:
- 7. Adjust Attrition Set' value (optional)

Expected:
- Attrition Set' value defaults to 1, user can change another value
- Attrition Set: The wastage allowance added to material requirements when calculating the quotation.

Steps:
- [Validation] If the user adjust Attrition Set <= 0

Expected:
- The value automatically reverts to the default value of 1.

*Next step*

Steps:
- 8. Click Next button

Expected:
- Parses BOM from system using Indented BoM template. Proceeds to Step 2.

Steps:
- [Validation] if the user does not fill in all the required fields

Expected:
- Display error in corner bottom-right  is "Please input information for assemblyPartNumber, partRev, partDesc"

Steps:
- 9. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 2 - Review BoM

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- - By default, system get value from step 1
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

Steps:
- [Optional] Update Build Qty' and Attrition Set's value

Expected:
- User can update Build Qty' and Attrition Set's value or not and values are applied in the next quoting steps

Steps:
- [Validation] If the user adjust Build Quantity and Attrition Set <= 0

Expected:
- The value automatically reverts to the default value of 1.

*Search & Filter*

Steps:
- 2. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG".

Steps:
- 2.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 2.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 2.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 2.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 3. Perform a filter

Expected:
- The filters are displayed in the following order from left to right: Is Exclude? (Include in quotation = FALSE), Missing Manufacturer

Expected:
- Status display default status is uncheck (both 2 filters)

Steps:
- 3.1. Filter by Is Exclude?

Expected:
- When the filter is selected, only BOM lines marked as excluded from quotation are displayed.

Expected:
- If there is all BOM lines marked as included from quotation, "No records available" is displayed.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Expected:
- When the user checks any of those rows, that BOM line is immediately removed from the filtered list and marked as Is Exclude.

Steps:
- 3.2. Filter by Missing Manufacturer

Expected:
- When the filter is selected, only BOM lines without manufacturer data are displayed.

Expected:
- If there is no BOM lines without manufactuer, "No records available" is displayed.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 4.
- 4.1. BoM detail format is displayed

Expected:
- BOM details are displayed in the format of the default template, which is configured in Inventory Management.

Expected:
- The columns Number, ROCKET_PN, Revision, Part Description, Part Source, and Quantity should be frozen, allowing users to scroll horizontally and still view the remaining columns.

Expected:
- Data from BoM file, system auto:
- Lines with the same Part Number and Revision are merged into a single line.

Expected:
- The Qty Need to Quote value is the sum of all merged line quantities.

Expected:
- This merging rule applies to parts used across multiple sub-assemblies or phantom levels.

Expected:
- The system identifies unique parts for merging based on Part Number and Revision.

Expected:
- The merging logic must work independently of the Select Column Detection value selected in Step 1.

Expected:
- If the selected template does not contain sufficient fulfill data, the system still maintains the correct merging rule based on Part Number and Revision.

Steps:
- 4.2. Verify checkbox selection

Expected:
- Each BOM line displays a selection checkbox.

Expected:
- Users can check or uncheck selectable BOM lines.

Expected:
- BOM lines with Part Source = MAKE or MAKE/PHANT are automatically marked as Is Exclude and are unchecked by default, because these parts are internally manufactured rather than externally purchased, so they are not required for supplier quotation.

Expected:
- BOM lines with Qty = 0 are automatically marked as Is Exclude and are unchecked by default.

Expected:
- If Part Source has no value, the system does not auto-exclude the BOM line based on Part Source alone.

Expected:
- Users can manually re-check BOM lines with Part Source = MAKE or MAKE/PHANT if needed.

Expected:
- Clicking the header checkbox selects all rows.

Expected:
- Clicking the header checkbox again deselects all rows.

Expected:
- Checkbox states are updated correctly based on user actions and auto-exclude conditions.

Expected:
- BOM lines marked as Is Exclude are not included in the quotation process unless the user manually re-checks them.

Steps:
- 4.3. Verify the display of Number

Expected:
- The NUMBER column is displayed.

Expected:
- Each BOM line shows the correct line number.

Expected:
- Line numbers are displayed in ascending sequential order.

Expected:
- The line number shown matches the corresponding BOM row.

Steps:
- 4.4. Verify the display of Rocket PN (Part Number)

Expected:
- Part numbers - Rev that already exist in Part Master are displayed with a green background.

Expected:
- Part numbers - Rev that already exist in Part Master are displayed with a green background.

Expected:
- Part numbers - Rev that do not exist in Part Master are displayed with a red background.

Expected:
- A red background indicates that the part has not been created in Part Master yet.

Expected:
- The user cannot confirm Project Requirement until all missing part numbers have been created in Part Master.

Steps:
- 4.5. Verify the display of Revision

Expected:
- Displays the correct revision of a part or BOM item, helping to identify the current version of the component or record.

Steps:
- 4.6. Verify the display of Part description

Expected:
- Displays the part description accurately, making it easy for users to identify the component's characteristics and name.

Steps:
- 4.7. Verify the display of Part source

Expected:
- Displays the correct part source (e.g., MAKE, BUY, MAKE/PHAN, FLRSTK, MAKE/BUY, and PACKAGING), helping users understand how the part is supplied or managed.

Steps:
- 4.8. Verify the display of Quantity

Expected:
- Displays the exact quantity of parts required in the BOM, facilitating material calculations and price quotations.

Steps:
- 4.9. Verify the display of Level

Expected:
- Displays the correct structural level of the part within the BOM, helping to identify the component's position within the parent-child hierarchy.

Steps:
- 4.10. Verify the display of MFG

Expected:
- Displays the correct part manufacturer, helping to identify the component's source of manufacture.

Expected:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.

Expected:
- The background color is displayed in yellow because the manufacturer value already exists in Manufacturer Management.

Steps:
- 4.11. Verify the display of MPN

Expected:
- Displays the correct manufacturer part number, enabling accurate identification of components based on the specific manufacturer.

Expected:
- The number of columns is determined based on the part with the highest number of MFG/MPN pairs. If an MFG column contains a value but the corresponding MPN column is empty, the system must still display that pair of columns to ensure no data is lost.

*Next step*

Steps:
- 5. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Previous, Next

Steps:
- 5.1. Click Next button

Expected:
- System computes TOTAL QTY = QtyPer × BuildQty + Attrition × AttritionSet per line.

Expected:
- Display Review Excluded Parts dialog. User review those excluded part(s) as listed. These parts will not be used to quote from Nexar and cannot be recalled
- Warning: After Run Quote in Step 3, excluded parts cannot be recovered.

Expected:
- Display the following columns in the dialog: Part Number, Part Rev, Part Description, Qty, Part Source

Expected:
- Action buttons:
- |_ Confirm & Continue: navigate to Step 3 - Quoting
- |_ Go Back: return to the current Step 2 screen

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 5.2. Click Previous button

Expected:
- Return to the previous step screen - step 1

Steps:
- 6. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains New.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 3 - Quoting

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- By default, system get value from step 2
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

Steps:
- [Optional] Update Build Qty' and Attrition Set's value

Expected:
- User may update Build Qty and Attrition Set values or leave them unchanged.

Expected:
- The updated values are applied in the next quoting steps only after the user clicks Apply.

Expected:
- If the user changes these values but does not click Apply, the changes are not saved or carried to the next steps.

Expected:
- If no changes are made, the system keeps and uses the current values for the next quoting steps.

Steps:
- 2. Select option in Primany Provider

Expected:
- - Default option: Nexar
- - Options: Nexar & Z2data
- - User can change another option

Steps:
- 2.1. Nexar

Expected:
- The system uses Nexar as the data source for quotation.

Steps:
- 2.2. Z2data

Expected:
- The system uses Z2data as the data source for quotation.

Steps:
- 3. Functional action buttons

Expected:
- The action buttons are displayed in the following order from left to right: Run Quote, Apply, Add Attrition, Apply Price Range

Expected:
- Run Quote is displayed as the primary button. Apply, Add Attrition, and Apply Price Range are displayed as secondary buttons.

Steps:
- 3.1. Run Quote

Expected:
- The system triggers the quotation process based on the selected conditions and input values.

Expected:
- The selected Primary Provider determines which data source the system uses first to retrieve quotation data.

Expected:
- If Nexar is selected as the Primary Provider, the system sends MPN values to the Nexar API first.

Expected:
- If an MPN is not found in Nexar, the system falls back to Z2Data to continue retrieving quotation data.

Expected:
- The system returns quotation results for all applicable BOM lines based on the available provider data.

Steps:
- 3.2. Apply

Expected:
- Recalculates the Total Qty for each part based on the updated Build Qty and Attrition Set values when the user clicks this button.

Expected:
- The calculation is: Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)

Steps:
- 3.3 Add Attrition

Expected:
- Display the Add Attrition dialog.

Expected:
- The following columns in the Add Attrition dialog: Actions, Part, Description, MFG, MPN, Qty, Attrition Qty, Total Qty

Expected:
- Display only part lines with Attrition = 0.

Expected:
- Do not display part lines that were marked as excluded in the previous step.

Expected:
- In the Actions column, allow user to open the Create New Attrition dialog to add attrition for the selected part.

Expected:
- After attrition is added with a value greater than 0:
- |_ The corresponding part line is removed from the Add Attrition dialog.
- |_The Attrition value is updated in the BOM line accordingly

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 3.4. Apply Price Range

Expected:
- When the user clicks Apply Price Range, the system evaluates each BOM line against the configured Attrition Info conditions.

Expected:
- If a BOM line matches a configured Price Range, the system applies the corresponding Attrition Qty to that BOM line.

Expected:
- If the quantity matches a different Price Range, the system re-evaluates and applies the Attrition Qty of the newly matched range.

Expected:
- If no condition is matched, the current Attrition value remains unchanged.

*Seach & Filter*

Steps:
- 4. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

Steps:
- 4.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 4.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 4.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 4.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 4.4. Search by Supplier

Expected:
- System shows BOM lines whose Supplier matches the entered keyword.

Steps:
- 5. Perform a filter

Expected:
- The filters are displayed from left to right in the following order: Unselected Supplier, Not Enough Qty, and Missing Attrition.

Expected:
- By default, no filter is applied, and all filter checkboxes are unchecked.

Steps:
- 5.1. Filter by Unselected Supplier

Expected:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Expected:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Expected:
- Only BOM lines with an empty or unassigned Supplier are shown in the filtered list.

Expected:
- BOM lines that already have a Supplier value are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.2. Filter by Not enough qty

Expected:
- After the user clicks Run Quote, BOM lines with insufficient quantity are displayed when Filter by Not Enough Qty is applied.

Expected:
- Only BOM lines that do not have enough available quantity to meet the required quote quantity are shown in the filtered list.

Expected:
- BOM lines with sufficient quantity are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.3. Filter by Missing Attrition

Expected:
- After the user clicks Run Quote, BOM lines without an Attrition value are displayed when Filter by Missing Attrition is applied.

Expected:
- Only BOM lines with missing or unresolved Attrition are shown in the filtered list.

Expected:
- BOM lines that already have a valid Attrition value are hidden from this filtered view.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 6. BoM detail format is displayed

Expected:
- BoM details are displayed with columns in order:
- |_ Part: Displays the part number or unique part identifier.
- |_ Revision: Displays the revision/version of the part.
- |_ Source: Indicates the sourcing type of the part, such as purchased or internally manufactured.
- |_ Description: Displays the part description for easy identification.
- |_ MFG: Displays the manufacturer name of the part.
- |_ MPN: Displays the manufacturer part number used for sourcing and quotation.
- |_ Qty: Displays the required quantity from the BOM.
- |_ Attrition: Displays the additional quantity added to cover expected loss or usage variation.
- |_ Total Qty: Displays the final quantity to be quoted, including BOM Qty and Attrition.
- |_ Supplier: Displays the selected or returned supplier for the part.
- |_ Order Qty: Displays the quantity that should be ordered from the supplier.
- |_ Stock: Displays the available supplier stock quantity.
- |_ LT: Displays the lead time required to obtain the part.
- |_ Pkg.: Displays the package type or packaging unit of the part.
- |_ MOQ: Displays the minimum order quantity required by the supplier.
- |_ Excess: Displays the quantity ordered beyond the required amount.
- |_ Unit Price: Displays the price per unit quoted by the supplier.
- |_ AMT: Displays the total quoted amount for the line.
- |_ Excess AMT: Displays the cost impact of the excess quantity.
- |_ Status: Displays the quotation result or supply status of the BOM line.
- |_ Notes: Displays additional remarks or quotation-related information for the BOM line.

Steps:
- 6.1. Before Run Quote

Expected:
- Auto compute attrition qty by quote line's description

Expected:
- Auto compute total qty of each quote lines with formula: Total qty = (need qty x build qty) +
- (attrition x attrition set)

Expected:
- Supplier-related, pricing-related, and availability-related information is not displayed.

Expected:
- The following columns have a red background color by default: MPN, Order Qty, Stock, LT, Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes

Expected:
- The default values are:
- |_ Order Qty = 0
- |_ MOQ = 0
- |_ Excess = 0
- |_ Excess AMT = $0.000
- |_ Status = N/A

Expected:
- The following fields are blank: Supplier, Stock, LT, Pkg., Unit Price, AMT, Notes

Steps:
- 6.2. Excluded BOM lines

Expected:
- BOM lines excluded in the previous step are displayed with a gray background color.

Expected:
- Excluded BOM lines have Status = NO BID.

Expected:
- Excluded BOM lines display only the following information: Part, Revision, Source, Description, MFG, MPN, Qty, Total Qty

Expected:
- Excluded BOM lines are not considered valid for quotation business processing.

Steps:
- 6.3. After Run Quote

Expected:
- BOM lines without a Supplier are displayed with a red background color and Status = N/A.

Expected:
- BOM lines with Not Enough Qty are displayed with a yellow background color and Status = NO.

Expected:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly

Expected:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly, and the BOM line is highlighted with a green background color.

Expected:
- If a BOM lines with a valid Supplier are displayed with status = cover

Expected:
- Supplier dropdown shows: Supplier, PKG, Stock, LT, Price Break,
- MOQ, UP, NTO, Excess, Ext, Status. Preferred suppliers shown
- first; click "view more" for non-preferred.

Expected:
- If user want to change qty, they no need to re-run, just click APPLY to let system auto compute and select supplier with new changes

Steps:
- 7. More adjustion

Expected:
- Users can manually update the values of MPN, Attrition, Supplier, Order Qty, and Notes on each BOM line.

Expected:
- When the Attrition value is changed, the system automatically recalculates the Total Qty accordingly.

Expected:
- If the user enters an Attrition value less than 0, the system automatically resets the value to 0.

Expected:
- If the user enters an Order Qty value less than 0, the system automatically resets the value to 0.

Expected:
- Any updated values are reflected correctly on the corresponding BOM line.

*Next step*

Steps:
- 7. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Expected:
- All of the action buttons have an enabled status

Steps:
- 7.1. Save draft button

Expected:
- Save Draft allows the user to save the current quotation progress at Step 3 without completing the final quotation process.

Expected:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Expected:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Expected:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Expected:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Expected:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

Steps:
- 7.2. Previous button

Expected:
- Return to the previous step screen - step 2

Steps:
- 7.3. Next button

Expected:
- Displays a confirmation dialog before proceeding.

Expected:
- The confirmation dialog contains a section listing all unselected parts that will be changed to NO BID if the user continues.

Expected:
- The confirmation dialog contains a section listing all excess parts.

Expected:
- The confirmation dialog displays the Total Excess Amount at the bottom-right of the dialog.

Expected:
- The confirmation dialog provides the following action buttons:
- |_ Back to Rework
- |_ Accept & Continue

Expected:
- If the user clicks Back to Rework, the system closes the confirmation dialog and returns the user to Step 3 - Quoting.

Expected:
- If the user clicks Accept & Continue, the system proceeds to Step 4 - Summary.

Expected:
- If the user continues, all unselected BOM lines are updated to Status = NO BID accordingly.

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 8. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains In-Progress.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


### Step 4 - Summary

*Review information of Quoting BoM*

Steps:
- 1. System show quoting BoM information get from previous step

Expected:
- By default, system get value from step 3
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Build Qty
- |_ Attrition Set
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Run by: Displays the user who executed the quotation process in Step 3.
- |_ Run Date: Displays the date and time when the quotation process was executed in Step 3, using the date and time format configured in the Region Language Format settings.
- |_ Run Version: Displays the quotation run version generated for that execution in Step 3. The initial run version is 1.

Steps:
- 2. Review cost summary

Expected:
- The panel includes the following fields:
- |_ Cost/Board: is calculated as the sum of the material cost per board for all quoted BOM lines.
- Calculation: (Qty1 × Unit Price1) + (Qty2 × Unit Price2) + ...
- |_ Cost/Board with Markup: is calculated by applying the markup to Cost/Board.
- Calculation: Cost/Board × (1 + Markup)
- |_ Total Cost: is calculated as the total cost of all quoted BOM lines.
- Calculation: Sum of all BOM line Amount values
- Or equivalently: (Total Qty1 × Unit Price1) + (Total Qty2 × Unit Price2) + ...
- |_ Total Cost with Markup: is calculated by applying the markup to Total Cost.
- Calculation: Total Cost × (1 + Markup)

Expected:
- All values are displayed using the configured currency format.

Expected:
- Excess Amount is highlighted in red to distinguish excess-related cost from other summary values.

Expected:
- Cost/Board, Cost/Board with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Expected:
- Total Cost, Total Cost with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Expected:
- The Add Package button is displayed below the cost summary section.

Expected:
- When quotation data is available, all summary values are calculated and displayed based on the quotation result from previous steps.

Steps:
- 3. Click Add Package button

Expected:
- The system displays the Add: Packages dialog. The dialog allows the user to add a package item into the quotation BOM list.

Expected:
- The Select Part dropdown list displays only parts that:
- belong to the same Customer as the current quotation, and are created with Part Source = Packaging.

Expected:
- Auto-filled after the user selects a part:
- |_ Description: The description of the selected part. (read-only)
- |_ MFG: The manufacturer of the selected part. (read-only)
- |_ MPN: The part numner of the selected part. (read-only)

Expected:
- Allow user add or more adjust
- |_ Select Quantity: Input the selected package quantity.
- |_ Unit Price: Input the unit price of the selected package part.
- |_ Notes: Enter additional notes for the package line.

Expected:
- Total Quantity: The total quantity of the selected package, default value is 1 when the dialog is opened (read-only)

Expected:
- Total Quantity:  After the user enters Select Quantity, this field is automatically updated accordingly.

Expected:
- Amount: The total amount of the package line.
- |_ Calculation: Unit Price × Total Quantity, is updated automatically when Unit Price or Total Quantity changes (read-onlu)

Expected:
- Action button (Add and Discard) display on top left

Expected:
- When use Add button:
- |_ Adds the selected package line into the BOM summary list and don't miss any information
- |_ The system saves the entered package information and closes the dialog.
- |_ Recalculate related summary values, including: Total Cost, Cost/Board, Total Cost with Markup, Cost/Board with Markup

Expected:
- When use Discard button: Closes the dialog without saving any changes.
- No package line is added to the BOM list.

Expected:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close: No package line is added if the user has not clicked Add.

Expected:
- Allows the user to input the unit price of the selected package part.

*Seach & Filter*

Steps:
- 4. Perform a search

Expected:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

Steps:
- 4.1. Search by Part Number

Expected:
- System shows BOM lines whose part number matches the entered keyword.

Steps:
- 4.2. Search by Description

Expected:
- System shows BOM lines whose description matches the entered keyword.

Steps:
- 4.3. Search by MPN

Expected:
- System shows BOM lines whose MPN matches the entered keyword.

Steps:
- 4.4. Search by MFG

Expected:
- System shows BOM lines whose MFG matches the entered keyword.

Steps:
- 4.4. Search by Supplier

Expected:
- System shows BOM lines whose Supplier matches the entered keyword.

Steps:
- 5. Perform a filter

Expected:
- The filters are displayed from left to right in the following order: No bid, Not enough qty, excess qty

Expected:
- By default, no filter is applied, and all filter checkboxes are unchecked.

Steps:
- 5.1. Filter by No bid

Expected:
- When the user selects the No Bid filter, the system displays only BOM lines that do not have a selected Supplier.

Expected:
- BOM lines with a valid Supplier are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.2. Filter by Not enough qty

Expected:
- When the user selects the Not Enough Qty filter, the system displays only BOM lines with Status = NO.

Expected:
- BOM lines with other statuses are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

Steps:
- 5.3. Filter by Excess qty

Expected:
- When the user selects the Excess Qty filter, the system displays only BOM lines with Excess AMT > 0.

Expected:
- BOM lines with Excess AMT = 0 are hidden from the list.

Expected:
- When the filter is cleared, all BOM lines are displayed again.

*Review all of BoM line*

Steps:
- 6. BoM detail format is displayed

Expected:
- BoM details are displayed with columns in order:
- Part, Revision, description, mfg, mpn, qty, attrition, total qty, supplier, order qty, stock, out stock, lt, pkg., moq, unit price, amount, excess qty, excess amt, status, notes

Expected:
- The user can update another valid option in the Status

Expected:
- User can add a new BOM line by using Add Package when applicable.

Expected:
- All other BOM line information is displayed as read-only.

*Next step*

Steps:
- 7. Action button

Expected:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Expected:
- All of the action buttons have an enabled status

Steps:
- 7.1. Save draft button

Expected:
- Save Draft allows the user to save the current quotation progress at Step 4 without completing the final quotation process.

Expected:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Expected:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Expected:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Expected:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Expected:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

Steps:
- 7.2. Previous button

Expected:
- Return to the previous step screen - step 3

Steps:
- 7.3. Submit button

Expected:
- If submit is successful, the system displays a success message: Add Quotation Result.

Expected:
- If submit is unsuccessful, the system displays an appropriate error message, not redirection another page

Expected:
- When the user clicks Submit, the system creates a new Quotation Result record successfully.

Expected:
- The new quotation result is added to the list in the Quotation Result tab.

Expected:
- Each Quotation Result line displays the following information:
- Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt, Total w/ Markup, Last Run By, Last Run Date, Last Run Version, BoM File

Expected:
- Last Run Version displays the corresponding assembly run number.

Expected:
- If the user runs quotation again for the same existing BOM, the Last Run Version is incremented by 1.

Expected:
- Each quotation result line allows the user to open and view the corresponding quotation detail.

Steps:
- 8. Status Project Requirement

Expected:
- If no quotation has been run previously, meaning the current run is the first run, the Project Requirement status remains Quoted.

Expected:
- If a quotation has already been run previously, the Project Requirement status is determined based on the status from the most recent quotation run.


## PR - NC - Resume Draft Quote


### Resume Draft Quote
- Use case:  Used when the PM needs to continue working on a previously saved draft quotation that has not been completed or submitted yet.
* This use case applies only to new customers.


### Step 1 - Config BoM


**Review information in the Continue from drafts**

Steps:
- Pre-condition: At least one previously saved draft quotation available for the selected customer and assembly.
- Display a list of saved draf quotations in the table

Steps:
- Each draft quotation row includes the following information and read-only:
- |_ Action: Provides the Continue action that allows the user to resume the selected draft quotation.
- |_ Assembly Name: Identifies the assembly associated with the draft quotation.
- |_ Revision: Indicates the revision level of the assembly, used together with the Assembly Name to identify a specific part version.
- |_ Description: Provides a brief description of the assembly for easier identification.
- |_ Build Qty: Indicates the build quantity defined in the draft quotation.
- |_ Attrition Set: Indicates the attrition value or attrition set applied to the draft quotation.
- |_ Created Date: Indicates the date and time when the draft quotation was created.

Steps:
- In each row' action columns displays a Continue button for each draft quotation row.

*Click the Continue button*

Steps:
- Redirect to Step 3 - Quoting for the selected draft

Steps:
- The system displays the quotation data associated with the selected draft record.


### Step 3 - Quoting


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 2
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Build Qty
- |_ Attrition Set

*[Optional] Update Build Qty' and Attrition Set's value*

Steps:
- User may update Build Qty and Attrition Set values or leave them unchanged.

Steps:
- The updated values are applied in the next quoting steps only after the user clicks Apply.

Steps:
- If the user changes these values but does not click Apply, the changes are not saved or carried to the next steps.

Steps:
- If no changes are made, the system keeps and uses the current values for the next quoting steps.

*2. Select option in Primany Provider*

Steps:
- - Default option: Nexar
- - Options: Nexar & Z2data
- - User can change another option

*2.1. Nexar*

Steps:
- The system uses Nexar as the data source for quotation.

*2.2. Z2data*

Steps:
- The system uses Z2data as the data source for quotation.

*3. Functional action buttons*

Steps:
- The action buttons are displayed in the following order from left to right: Run Quote, Apply, Add Attrition, Apply Price Range

Steps:
- Run Quote is displayed as the primary button. Apply, Add Attrition, and Apply Price Range are displayed as secondary buttons.

*3.1. Run Quote*

Steps:
- The system triggers the quotation process based on the selected conditions and input values.

Steps:
- The selected Primary Provider determines which data source the system uses first to retrieve quotation data.

Steps:
- If Nexar is selected as the Primary Provider, the system sends MPN values to the Nexar API first.

Steps:
- If an MPN is not found in Nexar, the system falls back to Z2Data to continue retrieving quotation data.

Steps:
- The system returns quotation results for all applicable BOM lines based on the available provider data.

*3.2. Apply*

Steps:
- Recalculates the Total Qty for each part based on the updated Build Qty and Attrition Set values when the user clicks this button.

Steps:
- The calculation is: Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)

*3.3 Add Attrition*

Steps:
- Display the Add Attrition dialog.

Steps:
- The following columns in the Add Attrition dialog: Actions, Part, Description, MFG, MPN, Qty, Attrition Qty, Total Qty

Steps:
- Display only part lines with Attrition = 0.

Steps:
- Do not display part lines that were marked as excluded in the previous step.

Steps:
- In the Actions column, allow user to open the Create New Attrition dialog to add attrition for the selected part.

Steps:
- After attrition is added with a value greater than 0:
- |_ The corresponding part line is removed from the Add Attrition dialog.
- |_The Attrition value is updated in the BOM line accordingly

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*3.4. Apply Price Range*

Steps:
- When the user clicks Apply Price Range, the system evaluates each BOM line against the configured Attrition Info conditions.

Steps:
- If a BOM line matches a configured Price Range, the system applies the corresponding Attrition Qty to that BOM line.

Steps:
- If the quantity matches a different Price Range, the system re-evaluates and applies the Attrition Qty of the newly matched range.

Steps:
- If no condition is matched, the current Attrition value remains unchanged.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: Unselected Supplier, Not Enough Qty, and Missing Attrition.

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by Unselected Supplier*

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- After the user clicks Run Quote, BOM lines without a Supplier value are displayed when Filter by Unselected Supplier is applied.

Steps:
- Only BOM lines with an empty or unassigned Supplier are shown in the filtered list.

Steps:
- BOM lines that already have a Supplier value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- After the user clicks Run Quote, BOM lines with insufficient quantity are displayed when Filter by Not Enough Qty is applied.

Steps:
- Only BOM lines that do not have enough available quantity to meet the required quote quantity are shown in the filtered list.

Steps:
- BOM lines with sufficient quantity are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Missing Attrition*

Steps:
- After the user clicks Run Quote, BOM lines without an Attrition value are displayed when Filter by Missing Attrition is applied.

Steps:
- Only BOM lines with missing or unresolved Attrition are shown in the filtered list.

Steps:
- BOM lines that already have a valid Attrition value are hidden from this filtered view.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- |_ Part: Displays the part number or unique part identifier.
- |_ Revision: Displays the revision/version of the part.
- |_ Source: Indicates the sourcing type of the part, such as purchased or internally manufactured.
- |_ Description: Displays the part description for easy identification.
- |_ MFG: Displays the manufacturer name of the part.
- |_ MPN: Displays the manufacturer part number used for sourcing and quotation.
- |_ Qty: Displays the required quantity from the BOM.
- |_ Attrition: Displays the additional quantity added to cover expected loss or usage variation.
- |_ Total Qty: Displays the final quantity to be quoted, including BOM Qty and Attrition.
- |_ Supplier: Displays the selected or returned supplier for the part.
- |_ Order Qty: Displays the quantity that should be ordered from the supplier.
- |_ Stock: Displays the available supplier stock quantity.
- |_ LT: Displays the lead time required to obtain the part.
- |_ Pkg.: Displays the package type or packaging unit of the part.
- |_ MOQ: Displays the minimum order quantity required by the supplier.
- |_ Excess: Displays the quantity ordered beyond the required amount.
- |_ Unit Price: Displays the price per unit quoted by the supplier.
- |_ AMT: Displays the total quoted amount for the line.
- |_ Excess AMT: Displays the cost impact of the excess quantity.
- |_ Status: Displays the quotation result or supply status of the BOM line.
- |_ Notes: Displays additional remarks or quotation-related information for the BOM line.

*6.1. Before Run Quote*

Steps:
- Auto compute attrition qty by quote line's description

Steps:
- Auto compute total qty of each quote lines with formula: Total qty = (need qty x build qty) +
- (attrition x attrition set)

Steps:
- Supplier-related, pricing-related, and availability-related information is not displayed.

Steps:
- The following columns have a red background color by default: MPN, Order Qty, Stock, LT, Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes

Steps:
- The default values are:
- |_ Order Qty = 0
- |_ MOQ = 0
- |_ Excess = 0
- |_ Excess AMT = $0.000
- |_ Status = N/A

Steps:
- The following fields are blank: Supplier, Stock, LT, Pkg., Unit Price, AMT, Notes

*6.2. Excluded BOM lines*

Steps:
- BOM lines excluded in the previous step are displayed with a gray background color.

Steps:
- Excluded BOM lines have Status = NO BID.

Steps:
- Excluded BOM lines display only the following information: Part, Revision, Source, Description, MFG, MPN, Qty, Total Qty

Steps:
- Excluded BOM lines are not considered valid for quotation business processing.

*6.3. After Run Quote*

Steps:
- BOM lines without a Supplier are displayed with a red background color and Status = N/A.

Steps:
- BOM lines with Not Enough Qty are displayed with a yellow background color and Status = NO.

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly

Steps:
- If a BOM line has a valid Supplier, the related quotation information is displayed accordingly, and the BOM line is highlighted with a green background color.

Steps:
- If a BOM lines with a valid Supplier are displayed with status = cover

Steps:
- Supplier dropdown shows: Supplier, PKG, Stock, LT, Price Break,
- MOQ, UP, NTO, Excess, Ext, Status. Preferred suppliers shown
- first; click "view more" for non-preferred.

Steps:
- If user want to change qty, they no need to re-run, just click APPLY to let system auto compute and select supplier with new changes

*7. More adjustion*

Steps:
- Users can manually update the values of MPN, Attrition, Supplier, Order Qty, and Notes on each BOM line.

Steps:
- When the Attrition value is changed, the system automatically recalculates the Total Qty accordingly.

Steps:
- If the user enters an Attrition value less than 0, the system automatically resets the value to 0.

Steps:
- If the user enters an Order Qty value less than 0, the system automatically resets the value to 0.

Steps:
- Any updated values are reflected correctly on the corresponding BOM line.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 3 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 2

*7.3. Next button*

Steps:
- Displays a confirmation dialog before proceeding.

Steps:
- The confirmation dialog contains a section listing all unselected parts that will be changed to NO BID if the user continues.

Steps:
- The confirmation dialog contains a section listing all excess parts.

Steps:
- The confirmation dialog displays the Total Excess Amount at the bottom-right of the dialog.

Steps:
- The confirmation dialog provides the following action buttons:
- |_ Back to Rework
- |_ Accept & Continue

Steps:
- If the user clicks Back to Rework, the system closes the confirmation dialog and returns the user to Step 3 - Quoting.

Steps:
- If the user clicks Accept & Continue, the system proceeds to Step 4 - Summary.

Steps:
- If the user continues, all unselected BOM lines are updated to Status = NO BID accordingly.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close


### Step 4 - Summary


**Review information of Quoting BoM**

*1. System show quoting BoM information get from previous step*

Steps:
- By default, system get value from step 3
- |_ Assembly Part Number - Rev
- |_ Description
- |_ Build Qty
- |_ Attrition Set
- |_ Quote Focus
- |_ Material Package Type
- |_  Markup
- |_ Run by: Displays the user who executed the quotation process in Step 3.
- |_ Run Date: Displays the date and time when the quotation process was executed in Step 3, using the date and time format configured in the Region Language Format settings.
- |_ Run Version: Displays the quotation run version generated for that execution in Step 3. The initial run version is 1.

*2. Review cost summary*

Steps:
- The panel includes the following fields:
- |_ Cost/Board: is calculated as the sum of the material cost per board for all quoted BOM lines.
- Calculation: (Qty1 × Unit Price1) + (Qty2 × Unit Price2) + ...
- |_ Cost/Board with Markup: is calculated by applying the markup to Cost/Board.
- Calculation: Cost/Board × (1 + Markup)
- |_ Total Cost: is calculated as the total cost of all quoted BOM lines.
- Calculation: Sum of all BOM line Amount values
- Or equivalently: (Total Qty1 × Unit Price1) + (Total Qty2 × Unit Price2) + ...
- |_ Total Cost with Markup: is calculated by applying the markup to Total Cost.
- Calculation: Total Cost × (1 + Markup)

Steps:
- All values are displayed using the configured currency format.

Steps:
- Excess Amount is highlighted in red to distinguish excess-related cost from other summary values.

Steps:
- Cost/Board, Cost/Board with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- Total Cost, Total Cost with Markup are higlighted in black to  distinguish excess-related cost from other summary values.

Steps:
- The Add Package button is displayed below the cost summary section.

Steps:
- When quotation data is available, all summary values are calculated and displayed based on the quotation result from previous steps.

*3. Click Add Package button*

Steps:
- The system displays the Add: Packages dialog. The dialog allows the user to add a package item into the quotation BOM list.

Steps:
- The Select Part dropdown list displays only parts that:
- belong to the same Customer as the current quotation, and are created with Part Source = Packaging.

Steps:
- Auto-filled after the user selects a part:
- |_ Description: The description of the selected part. (read-only)
- |_ MFG: The manufacturer of the selected part. (read-only)
- |_ MPN: The part numner of the selected part. (read-only)

Steps:
- Allow user add or more adjust
- |_ Select Quantity: Input the selected package quantity.
- |_ Unit Price: Input the unit price of the selected package part.
- |_ Notes: Enter additional notes for the package line.

Steps:
- Total Quantity: The total quantity of the selected package, default value is 1 when the dialog is opened (read-only)

Steps:
- Total Quantity:  After the user enters Select Quantity, this field is automatically updated accordingly.

Steps:
- Amount: The total amount of the package line.
- |_ Calculation: Unit Price × Total Quantity, is updated automatically when Unit Price or Total Quantity changes (read-onlu)

Steps:
- Action button (Add and Discard) display on top left

Steps:
- When use Add button:
- |_ Adds the selected package line into the BOM summary list and don't miss any information
- |_ The system saves the entered package information and closes the dialog.
- |_ Recalculate related summary values, including: Total Cost, Cost/Board, Total Cost with Markup, Cost/Board with Markup

Steps:
- When use Discard button: Closes the dialog without saving any changes.
- No package line is added to the BOM list.

Steps:
- Allow user to use dialog window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close: No package line is added if the user has not clicked Add.

Steps:
- Allows the user to input the unit price of the selected package part.


**Seach & Filter**

*4. Perform a search*

Steps:
- Search field allows users to enter any value and displays the placeholder "Search by Part / Description / MPN / MFG / Supplier".

*4.1. Search by Part Number*

Steps:
- System shows BOM lines whose part number matches the entered keyword.

*4.2. Search by Description*

Steps:
- System shows BOM lines whose description matches the entered keyword.

*4.3. Search by MPN*

Steps:
- System shows BOM lines whose MPN matches the entered keyword.

*4.4. Search by MFG*

Steps:
- System shows BOM lines whose MFG matches the entered keyword.

*4.4. Search by Supplier*

Steps:
- System shows BOM lines whose Supplier matches the entered keyword.

*5. Perform a filter*

Steps:
- The filters are displayed from left to right in the following order: No bid, Not enough qty, excess qty

Steps:
- By default, no filter is applied, and all filter checkboxes are unchecked.

*5.1. Filter by No bid*

Steps:
- When the user selects the No Bid filter, the system displays only BOM lines that do not have a selected Supplier.

Steps:
- BOM lines with a valid Supplier are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.2. Filter by Not enough qty*

Steps:
- When the user selects the Not Enough Qty filter, the system displays only BOM lines with Status = NO.

Steps:
- BOM lines with other statuses are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.

*5.3. Filter by Excess qty*

Steps:
- When the user selects the Excess Qty filter, the system displays only BOM lines with Excess AMT > 0.

Steps:
- BOM lines with Excess AMT = 0 are hidden from the list.

Steps:
- When the filter is cleared, all BOM lines are displayed again.


**Review all of BoM line**

*6. BoM detail format is displayed*

Steps:
- BoM details are displayed with columns in order:
- Part, Revision, description, mfg, mpn, qty, attrition, total qty, supplier, order qty, stock, out stock, lt, pkg., moq, unit price, amount, excess qty, excess amt, status, notes

Steps:
- The user can update another valid option in the Status

Steps:
- User can add a new BOM line by using Add Package when applicable.

Steps:
- All other BOM line information is displayed as read-only.


**Next step**

*7. Action button*

Steps:
- The action buttons are displayed in the following order from left to right: Save draft, Previous, Next

Steps:
- All of the action buttons have an enabled status

*7.1. Save draft button*

Steps:
- Save Draft allows the user to save the current quotation progress at Step 4 without completing the final quotation process.

Steps:
- The system stores the current BOM line adjustments and quotation-related values so the user can continue working later.

Steps:
- After the draft is saved successfully, the system displays a success message: "Save draft quotation successfully!"

Steps:
- The success message is shown at the bottom-right corner of the screen with a green highlight.

Steps:
- After saving the draft successfully, the user remains on the current page and is not redirected to another page.

Steps:
- After saving the draft successfully, the Project Requirement status is updated to In Progress.

*7.2. Previous button*

Steps:
- Return to the previous step screen - step 3

*7.3. Submit button*

Steps:
- If submit is successful, the system displays a success message: Add Quotation Result.

Steps:
- If submit is unsuccessful, the system displays an appropriate error message, not redirection another page

Steps:
- When the user clicks Submit, the system creates a new Quotation Result record successfully.

Steps:
- The new quotation result is added to the list in the Quotation Result tab.

Steps:
- Each Quotation Result line displays the following information:
- Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt, Total w/ Markup, Last Run By, Last Run Date, Last Run Version

Steps:
- Last Run Version displays the corresponding assembly run number.

Steps:
- If the user runs quotation again for the same existing BOM, the Last Run Version is incremented by 1.

Steps:
- The BOM File field is blank / has no file information when the quotation is run from an existing BOM.

Steps:
- Each quotation result line allows the user to open and view the corresponding quotation detail.


## PR - PR List


### Project Requirement List
- Use case: Used when the PM needs to access the list of project requirements in order to review, track, and manage RFQs created for customer quotation requests throughout the quotation process.

*View the list Project Requirement*

Steps:
- 1. Access the /sales-management/quotation page.

Expected:
- Display the list of Project Requirements based on the configured view template.

Expected:
- The highlighted menu item is "Project Requirement," which corresponds to accessing the Project Requirement list.

Expected:
- Page' header is Project Requirement

Steps:
- 2. Function action button

Expected:
- The action buttons are displayed in the following order from left to right:
- |_ Left corner: Add New
- |_ Right corner: Select View, Filter Toolbar, Setup View Template

Expected:
- Display tooltips (explaining the role) corresponding to their buttons.

Steps:
- 2.1. Add New

Expected:
- Show the New Project Requirement modal to user process enter or select information for the new PR

Expected:
- Allow user to use modal window actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 2.2. Select View Template

Expected:
- The user can select a preconfigured view template, and the system automatically applies the saved filters, columns, and sorting without requiring the user to set them up again.

Expected:
- After selecting a specific view template, the system displays the PR list below in the format defined by the chosen template.

Steps:
- 2.3. Filter toolbar

Expected:
- Expand the area below the action buttons to display filtering fields; the specific filters shown depend on the configured template.

Expected:
- After filtered, the system displays the PR list below according to filters' input

Expected:
- Clicking the button again collapses the filter area.

Steps:
- 2.4. Setup View Template

Expected:
- Display the "Request For Quotation - View Setting" right sidebar

Expected:
- Allow user process create the new View Template

Expected:
- Allow user process adjust the exist View Template

Expected:
- In this sidebar, users can configure the Project Requirement process filters, select how many columns to display, and define which columns are used for sorting

Expected:
- Allow user to use sidebar actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

*Review all of Project Requirement lines*

Steps:
- 1. Project requirement list is displayed

Expected:
- The Project Requirement list is displayed with the columns in the order configured in the View Template.

Steps:
- 2. Click on columns' header

Expected:
- The system sorts the list in the opposite order of the default sort configured in the View Template for that column.

Steps:
- 3. Project Requirement line

Expected:
- All Project Requirement lines are displayed in read-only mode for quick viewing.

Expected:
- Each project requirement row includes the following columns:
- |_ View Detail: Provides an action for the user to open the detail modal of the selected project requirement.
- |_ Priority: Indicates the priority level of the project requirement using star icons.
- |_ No: Displays the unique reference number of the project requirement.
- |_ Project Name: Displays the name of the project requirement.
- |_ Customer Name: Identifies the customer associated with the project requirement.
- |_ Application: Displays the application type of the project requirement.
- |_ RFQ Type: Displays the RFQ type of the project requirement.
- |_ Order Type: Displays the order type of the project requirement.
- |_ Status: Displays the current status of the project requirement.
- |_ Date Needed: Displays the required date and time of the project requirement.
- |_ Created Date: Displays the date and time when the project requirement was created.
- |_ Last Updated Date: Displays the date and time when the project requirement was most recently updated.

Expected:
- The Status column displays each status using a color-coded label based on the status type:
- - New: Yellow
- - In-Progress: Green
- - Quoted: Purple
- - Completed: Light Green

Expected:
- All date/time columns are displayed using the format configured in System Configuration > Region Language Format Config.

Steps:
- 4. Click view detail Project Requirement

Expected:
- Display the Project Requirement detail modal

Expected:
- The system displays The complete information related to The selected RFQ.

Expected:
- The modal is displayed in view mode only.

Expected:
- Allow user to use modal actions:
- |_ Minimize
- |_ Maximize/Restore Down
- |_ Close

Steps:
- 5. Pagination

Expected:
- The user can select 20, 50, or 100 items per page.

Expected:
- The system updates the Project Requirement list based on the selected page size.

Expected:
- The system displays the correct number of records on the current page.

Expected:
- Pagination is recalculated correctly after the page size is changed.

Expected:
- The user can navigate to the first, previous, next, and last page.

Expected:
- The Previous and First buttons are disabled on the first page.

Expected:
- The Next and Last buttons are disabled on the last page.


## PR - View PR


### Component Name
- Use case: ...


### ...


## PR - Edit PR


### Component Name
- Use case: ...


### ...


## Template


### Component Name
- Use case: ...


### ...


## Compare BoM


**Compare BoM file**

*Context: Compare BoM File allows users to compare two BoMs — a New BoM and a Old BoM (from an existing Assembly or an independent file) — to identify matches, mismatches, and missing items based on Part ID. This helps users quickly detect discrepancies between BoM versions, verify data consistency, and support review or audit processes before using the BoM for quotation or production.*

*Select existing attached file in Project Requirement (RFQ)*

Steps:
- There are 2 places to compare BoM
- 1.1 Navigate to any Project Requirement detail page  > Click the BoM Comparison button
- 1.2  Navigate to Bills of Materials list > Click on the BoM Comparison button

Expected:
- The BoM Comparison pop-up is displayed.

Steps:
- 2. Select Customer

Expected:
- - Project Requirement page: Customer auto-selected from RFQ.
- - BoM list: Customer selected successfully.

Steps:
- 3. Select Template

Expected:
- Template is applied successfully

Steps:
- 4. Case: At Target BoM section, click "Upload or Select BoM file" field
- Context:
- - Select the BoM file from the RFQ attachments
- - Display the file content to be used as the Target BoM
- → Objective: Define the Target BoM for comparison

Expected:
- System displays list of attached files of this Project Requirement

Steps:
- 5. Click one file in the attachment list

Expected:
- - Select file name is displayed in the field
- - Corresponding BoM file content is displayed below

*Upload new BoM file*

Steps:
- 4. Case: At Target BoM section, click “Select File” button and choose a file
- Context:
- - Upload a new file from local
- - Disable the option to select an existing file
- → Objective: Use an external BoM as the Target BoM

Expected:
- - Selected file name is displayed below the button
- - “Upload or Select BoM file” field is disabled
- - User cannot select attached file anymore

Steps:
- 5. Select value from “Select Sheet” dropdown

Expected:
- Corresponding BoM content of selected sheet is displayed below

*Using Existing Assembly*

Steps:
- 6. Case: At Compare BoM section, check “Existing Assembly”
- Context:
- - Compare with a BoM belonging to an existing Assembly in the system
- - Data is retrieved by: Assembly → BoM file → Sheet
- → Objective: Compare against the standard / saved BoM

Expected:
- - The system displays the following fields:
- |_“Select Assembly” (dropdown)
- |_“Select BoM file” (dropdown)
- |_“Select sheet" (dropdown)
- - “Select BoM file” dropdown is disabled until an Assembly is selected.
- - “Select sheet” dropdown is disabled until a BoM file is selected.

Steps:
- 7. Select an option from the “Select Assembly” dropdown.

Expected:
- - The dropdown displays all Assemblies associated with the current Project Requirement (RFQ).
- - The selected Assembly value is displayed in the field
- - “Select BoM file” dropdown becomes enabled.
- - “Select sheet” dropdown remains disabled.

Steps:
- 8. Select an option from the “Select BoM file” dropdown.

Expected:
- - The dropdown displays all BoM files associated with the selected Assembly.
- - The selected BoM file name is displayed in the field.
- - “Select sheet” dropdown becomes enabled.

Steps:
- 9. Select an option from the “Select sheet” dropdown.

Expected:
- - The dropdown displays all sheets associated with the selected BoM file.
- - The selected sheet name is displayed in the field.
- - The corresponding sheet content is displayed in the Compare BoM preview area.

*Not using Existing Assembly*

Steps:
- 6. Case At Compare BoM section, uncheck “Existing Assembly”
- Context:
- - Compare with an independent BoM file (not associated with any Assembly)
- - The BoM can be selected from an RFQ or uploaded as a new file
- → Objective: Enable flexible comparison with any BoM source

Expected:
- - The system displays the following fields:
- |_“Select BoM file” (dropdown)
- |_“Select sheet” (dropdown)
- |_“Select files…” (button)
- - “Select sheet” dropdown is disabled until an BoM file is selected.

Steps:
- 7. Select an option from the “Select BoM file” dropdown.

Expected:
- - The dropdown displays all BoM file associated with the current Project Requirement (RFQ).
- - The selected BoM file value is displayed in the field
- - “Select sheet” dropdown becomes enabled.

Steps:
- 8. Select an option from the “Select sheet” dropdown.

Expected:
- - The dropdown displays all sheets associated with the selected BoM file.
- - The selected sheet name is displayed in the field.
- - The corresponding sheet content is displayed in Compare BoM preview area

Steps:
- 9. Click the "Select files..." button

Expected:
- - The selected file name is display in the field
- - The BoM file value in the “Select BoM file” field is cleared and no previous value is displayed.
- - The sheet value in the “Select sheet” field is cleared and no previous value is displayed.

Steps:
- 10. Select an option from the “Select sheet” dropdown.

Expected:
- - The dropdown displays all sheets associated with the selected BoM file.
- - The selected sheet name is displayed in the field.
- - The corresponding sheet content is displayed in the Compare BoM preview area.
- - "Select BoM file" dropdown remains disabled.

*Perform the BoM comparison.*

Steps:
- 11. Click the "Compare As Summary" button

Expected:
- - Display "BoM Comparison Summary" modal

Expected:
- - In "BoM Comparison Summary" modal
- + Display two icon button: "Expand All" & "Export to Excel"
- + The data below shows the Part ID comparison results between the Target BoM and the Compare BoM

Steps:
- 12. Click the "Expand All" button

Expected:
- - The detailed information of all Part IDs is displayed immediately.
- - The button changes to display "Collapse All"

Steps:
- 13. Click the "Collapse All" button

Expected:
- - All Part ID detailed information is collapsed immediately
- - The button changes to display "Expand All"

Steps:
- 14. Click the plus icon button of the Part ID row

Expected:
- - The detailed information of that Part ID is displayed immediately.
- - The button changes to the minus icon

Steps:
- 14. Click the minus icon button of the Part ID row

Expected:
- - The detailed information of that Part ID is collapsed immediately.
- - The button changes to the plus icon

Steps:
- 15. Click the "Export to excel" button

Expected:
- - The file result generated after the BoM comparison is downloaded successfully


## BoM Part MFG MPN


**Context: Part Master is for managing all parts in the system, including details such as Part Number, Description, Revision, Manufacturer, and MPN. Users can search, filter, create, import, and export part data — providing a standardized master data source used consistently across modules (BoM, Quotation, Inventory, etc.) to ensure data accuracy and efficient**


**Part Master List**

*View the Part Master list*

Steps:
- 1. Navigate to Inventory Management >> Part Master

Expected:
- Show the list of all parts

*Search Part*

Steps:
- 2. Searching box

Expected:
- Allow to search by description or part number with keyword

*Filter Part*

Steps:
- 3. Filter Tools

Expected:
- Allow to use advance Filter including:
- - Multi-Criteria Filtering
- - Customizable column visibility
- - Flexible sorting

*Setup View Template*

Steps:
- 4. Setup View Template

Expected:
- Allow users to create a new View template configured with Filter, Column, and Sort settings.

Steps:
- 5. Select View Template

Expected:
- Display view as corresponding template

*Create new Part*

Steps:
- 6. Click on the "Add new Part" button

Expected:
- Display the 'Add Part Master Detail' form to allow users to manually create a new part

*View Part Detail*

Steps:
- 7. Click on "Eye" button on each part's row to open a Part detail

Expected:
- Display the 'Add Part Master Detail' form, user can view or edit - see more

*Import Part*

Steps:
- 8. Click on the "Import" button

Expected:
- - Import All: Allows importing parts that can be used across the system.
- - Import by Customer: Allows importing parts per specific customer.

*Export Part Master Data*

Steps:
- 9. Check on part(s) want to export data
- 10. Click on the "Export Part Master Data" button

Expected:
- - Allow to select single or multi part before exporting by checking on 1st column on part's row
- - When clicking on Export download the Part Master data as an Excel file for selected part(s)


**Create New Part allows users to manually add a new part to the system when it doesn't already exist and file import is not used. Users fill in required details — including Part Number, Part Source, Description, Class, Type, and additional tabs for sales/purchase info, control requirements, dimensions, and file attachments — ensuring the part is standardized and immediately available for use across modules such as BoM, Quotation, and Inventory.**


**Part Master**

*Create the new Part*

Steps:
- 1. Click the Add new Part button

Expected:
- Display the Add Part Master Detail modal

Steps:
- 2. Provide part information

Expected:
- - Required fields must be filled before submitting the form
- - Optional fields can be left empty without blocking submission

Steps:
- 2.1 Enter unique Part Number + Part Rev
- 2.2 Enter Part Description

Expected:
- - Part Number (Text, Required) — Unique identifier for the part
- - Part Revision (Text, Optional) — Version/revision identifier of the part
- - Part Description (Text, Required) — Brief description of the part
- Note: The combination of Part Number + Part Revision must be unique. Together they identify a distinct part in the system.

Steps:
- 2.3 Select Part Source

Expected:
- - Part Source (Dropdown, Required) — Defines how the part is sourced, including:
- + BUY — Purchased from supplier
- + CONSG — Customer-owned (consignment) material
- + FLSTK — Common stock items (e.g., screws, small components)
- +  MAKE — Internally manufactured part
- +  MAKE/BUY — Can be manufactured or purchased (BoM optional)
- +  MAKE/PHAN — Phantom/logical assembly for component grouping (not physically stocked)
- Notes: The "BoM" button (top right corner) should be displayed only when Part Source = MAKE, MAKE/BUY or MAKE/PHAN

Steps:
- 2.4 Select Part Class and Part Type

Expected:
- - Part Class (Dropdown, Required) — Classification category (e.g., Assembly, PCBA,...)
- - Part Type (Dropdown, Required) — Sub-classification within Part Class
- + Only valid Part Type options mapped to the selected Part Class are displayed
- + Changing the Part Class will clear the previously selected Part Type (if not applicable), then system require user to re-select the valid one
- Notes: Users must select a Part Class before selecting relevant Part Type

Steps:
- 2.5. Select Package
- 2.6. Select ABC
- 2.7. Select Material Type

Expected:
- - Package (Dropdown, Optional) — Physical package type (eg, Cut Tape, Reels, Tray,...)
- - ABC (Dropdown, Required) — Inventory priority classification (A = High, B = Medium, C = Low)
- - Material Type (Dropdown, Optional) — Type of material (e.g., RoHS, Non-RoHS, Lead-Free)

Steps:
- Under tab "GENERAL INFO": This tab includes general info of this part which seperate into 3 sections

Steps:
- 2.8 Select Customer

Expected:
- - This is required field, place under tab "General Info >> Sales & Purchase section"
- - When selecting a value in the “Customer”, system auto adds the Customer Code as a prefix to the “Part Number” (if not already included)

Steps:
- 2.9 Provide info for section "Sales & Purchase"

Expected:
- Section: Sale & Purchase Info
- |_ “Customer Sales Price”: The selling price of the part offered to customers (manual or auto compute)
- |_  “Sales Price Taxes”: Tax rate applied on top of the sales price
- |_   “Material Price”: The actual cost incurred to acquire or produce the part material.
- |_  “Highest Cost: The actual running highest cost of the part based on historical purchases or production.
- |_  “Lowest Cost: The actual running lowest cost of the part based on historical purchases or production.
- |_  “Last PO Cost: The actual running last cost of the part based on current open Purchase order
- |_  “Last Received Cost: The actual running last cost of the part based on historical receipt.

Steps:
- 2.10 Provide info for section "Request & Control" section

Expected:
- Section: Requests & Controls
- |_ “Insp Request”: check if an inspection is required before the part is received
- |_ “SN Request”: check if a unique Serial Number must be assigned or tracked for this part.
- |_ “NCNR”: Marks the part as Non-Cancellable / Non-Returnable — once ordered, it cannot be cancelled or returned.
- |_ “First Article”: check if a First Article Inspection (FAI) is required for initial production approval.
- |_ “Lot Code Request”: check if a Lot Code must be recorded to enable lot-level traceability.
- |_ “Cert Request” check if a certification document (e.g., material cert, CoC) is required from the supplier.

Steps:
- 2.11 Provide info for section "Dimensions & Packages" section

Expected:
- Section: Dimensions & Packages section
- |__   “Unit of Measure”: Defines the unit used to measure the part
- |__   “Length”: length dimension of the part
- |__   “Width”: Width dimension of the part
- |__   “Depth”: Depth dimension of the part

Steps:
- Under Tab “Quantity Info”: This tab includes inventory and MRP info of this part

Steps:
- 2.12 Provide info for section "Reordering rule"

Expected:
- Section: Reordering rule
- |__ Order Policy: Determines the lot-sizing method MRP uses to calculate order quantities (e.g., exact demand vs. fixed batch).
- |__ Day of week: A specific day to consolidate and release orders, aligning with supplier schedules.
- |__ Min Order Qty: The minimum amount allowed for a single order. MRP rounds up smaller demands to meet this limit.
- |__ Order Multiple: The required batch increment for ordering (e.g., box of 50). MRP rounds up the quantity to the nearest multiple.

Steps:
- 2.13 Provide info for section "Demand & foracast"

Expected:
- Section: Demand & forecast planning
- |__  EAU  (Estimated Annual Usage): Projected yearly consumption of the part. Used for forecasting, budgeting, and negotiating supplier volume discounts.
- |__  Attrition: Expected percentage of parts lost or damaged during production. MRP adds this buffer to ensure the final output meets actual demand.
- |__ MRP Request: The calculated or forecasted quantity needed to fulfill upcoming demand, which triggers new purchase or production orders.

Steps:
- 2.14 Provide info for section " Lead time & Policies"

Expected:
- Section: Lead time & Policies
- |__ Pull in: The acceptable time window to advance an existing order to an earlier date to meet accelerated demand, instead of creating a new one.
- |__ Push Out: The acceptable time window to delay an existing order when demand drops, preventing excess inventory buildup.
- |__ Purchase Lead Time (Days): Total days from placing a purchase order with a supplier until the parts are received and ready for use.
- |__ Kitting Lead Time (Days): Time needed for warehouse staff to pick and group components into a kit before handing them to production.
- |__ Production Lead Time (Days): Total time required to physically manufacture or assemble the item on the shop floor.

Steps:
- 2.15 Provide attachment(s)

Expected:
- Display the “Upload File(s)” button (optional) allowing users to attach local files to centralize essential part documents (e.g., drawings, specs, certificates) as a single reference for all departments.

Steps:
- 3. Click the Save button

Expected:
- Create the new Part successfully

Expected:
- Display the details of the newly created part.

*Part Master Detail*

Steps:
- 1.Click on "Eye" button on each part's row to open a Part detail

Expected:
- Display all part information, including:
- - Part Number - Part Revision
- - Part Source
- - Description
- - Part Class
- - Part Type
- - ABC
- - Package
- - Material Type
- - General Info
- - Quantity Info
- - Other action buttons: QR code generator, Edit, Approve
- → Information cannot be edited in the action when seeing the Part detail

Steps:
- 2. Actions button
- 2.1. Click on the BoM button on each part's row (has part source is MAKE or MAKE/PHAN)

Expected:
- The system displays the BoM detail of the selected Part, including:
- - Customer: The specific client the assembly belongs to (crucial for custom or consigned parts).
- - Part Number – Part Revision: The item's unique identifier and its current engineering design level.
- - BoM Version: The specific iteration of the BoM used for version control.
- - ITAR: A compliance flag indicating if the part is subject to defense-related export controls.
- - Quantity: The base build quantity this BoM "recipe" is scaled for.
- - BoM Type: The category or purpose of the BoM
- - Run By: The user or system process that generated this BoM calculation/view.
- - Created Date: When this BoM version was initially created.
- - Last Updated Date: When this BoM was most recently modified.
- - Update BOM: Allows users to upload a new BoM file. Upon submission, it automatically creates a new iteration and increments the BoM Version (e.g., from 0 to 1, 1 to 2, etc.) to track historical changes.
- Note: All fields (except BoM Version) below are displayed as read-only in this pop-up to preserve data integrity and prevent unauthorized modifications to the core BoM metadata.

Steps:
- Under Tab “Components Part”: This tab includes all parts from the BoM file attached

Steps:
- 2.1.1. View all details information

Expected:
- - Displays the complete manufacturing "recipe" parsed from the uploaded BoM file, showing critical child component details:
- |_Component Part
- |_ Revision,
- |_ Part Source
- |_ Quantity
- |_ Manufacturer
- |_ MPN.
- - Each column is fully interactive, supporting bidirectional sorting, a "Clear" reset function, and advanced filtering (Contains, Does not contain, Is [not] equal to, Starts/Ends with, Is null, etc...) for precise and rapid data retrieval.

Steps:
- Under Tab “Other Information": .....

Steps:
- 2.1.2. View all details information

Steps:
- 2.2. Click on the Where PN used () button on each part's row (has part source is BUY or MAKE nếu nó là sub assembly)
- Note: This button is only available for parts with a Part Source of 'BUY' or 'MAKE' that act as sub-assemblies

Expected:
- - The "Where Part Number Used" pop-up successfully opens.
- - The "Where Part Number Used" pop-up instantly identifies all parent assemblies consuming this component, helping assess the impact of shortages or engineering changes.
- |_ Search: Features an active search bar ("Search by top assembly or description")
- |_ Displays the higher-level assemblies with columns: View Icon, Top Assembly, Revision, Description, Index, Quantity, and BoM Status.

Steps:
- 2.2. Edit Part

Expected:
- - All input fields are enabled and allowed to save a moderate amount of data for editing.
- - The user can discard all information of Part if not need to save it.

Steps:
- 2.3. QR Code Generator

Steps:
- 2.4. Approve

*Import the new Part*

*Export Part Master Data*


**Context: MFG–MPN (AML — Approved Manufacturer List) manages the list of valid Manufacturer and MPN combinations associated with each Part, serving as the foundation for identifying supply sources, supporting quotation and pricing, and tracking inventory and cost data. Users can view, add, edit, or delete MPN mappings and monitor key details such as on-hand quantity, safety stock, and cost per MPN — ensuring each part has accurate and optimized supply source information across Quotation, Sourcing, and Inventory modules.**


**MFG-MPN (AML)**

*View the Part detail*

Steps:
- 1. Open a Part detail (Part has Part Source is MAKE, MAKE/BUY)

Expected:
- Display the details of the corresponding part.

*View the quality information for the MFG–MPN.*

Steps:
- 2. Navigate to Quantity Info tab.

Expected:
- Displays the MPN Mapping table, including the information columns:
- - Manufacturer: Original manufacturer of the component.
- - MPN: Exact manufacturer part number used for purchasing.
- - Description: Brief technical specifications of the MPN.
- - Order Preference: Purchasing priority (Primary/Alternate) guiding buyers.
- - Rocket OH (On-Hand): Company-owned inventory available for any project.
- - Customer OH (On-Hand): Consigned inventory restricted to specific customer orders.
- - Total On-Hand: Total physical stock available (Rocket OH + Customer OH).
- - Safety Stock: Minimum buffer inventory required to prevent material shortages.
- - AVG Cost: Average unit cost of current inventory, used for production costing.
- - Last Purchased Cost: Unit price from the most recent order, tracking market fluctuations.

*Action buttons*

Steps:
- 3. View MFG-MPN Mapping detail

Expected:
- Display the MPN Mapping detail popup, the user can:
- - View all of the information (Part Number, Manufacturer, Description, MPN, Order Preference)
- - Edit any information (except Part Number and Description)
- - Delete MFG-MPN (AML)

Steps:
- 4. Click on the Stock icon button

Expected:
- Display the Stock Report pop-up, user can:
- - Update Quantity: Edit the current inventory quantity via the Update Quantity pop-up
- - Replenishment: Add stock to inventory

*Add the new MPN Mapping*

Steps:
- 5. Click on the Add a line button

Expected:
- Display the Add MPN Mapping modal to enter all required information for the new MPN Mapping

Steps:
- 6. Click on the Save button

Expected:
- - New MPN Mapping created successfully
- - Add the New line MFG-MPN in MPN Mapping table


**Bill of Materials (BoM) manages the product structure for each assembly, defining the complete list of component parts with details such as Part Number, Revision, Quantity, Version, and MFG–MPN. Users can view, search, compare, and create BoMs by uploading files — ensuring accurate product structure definition that supports downstream processes including Quotation, Manufacturing, and Inventory planning.**


**Bill of Materials**

*Bill of Materials list*

Steps:
- 1. Navigate to Inventory Management >> Bill of Materials

Expected:
- Show the list of all parts

Steps:
- 2. Searching box

Expected:
- Allow to search by description or part number with keyword

Steps:
- 3. Click the "BoM Comparison" button

Expected:
- Follow the same behavior as defined in here

*Create the new BoM*

Steps:
- 1. Navigate to Inventory Management >> Bill of Materials
- >> Click on the Upload BoM button

Expected:
- Show the Bill of Material form in Step 1 - Config BoM

Expected:
- Bill Marterial form includes:
- |_ RFQ Information section:
- |_ Customer (dropdown, required)
- |_ Run by (textfield, read-only)
- |_ Created Date (textfield, read-only)
- |_ Last Updated Date (textfield, read-only)
- |_ Select Action (required) section has 2 options:
- |_ Import New BoM (checkbox, default selected)
- |_ Load Existing BoM (checkbox)
- The Assembly Info and Component Info display will depend on the option the user selects (Import new BOM, Load existing BOM).

Steps:
- 2. Select Action
- 2.1. Choose option Import New BoM

Expected:
- Display
- |_ Assembly Info section
- |_ Assembly Part Number (textfield, required, auto add customer code in front of assembly part number)
- |_ Revision (textfield, option)
- |_Description (textfield, required)
- |_ BoM Version (number field, read-only)
- |_ Quantity (number field, read-only)
- |_ Part Class (dropdown, required)
- |_ Part Type (dropdown, required)
- |_ Component Info section
- |_ Upload file (button, required)
- |_ Select AML Format (Vertical, Horizontal)
- |_ Vertical:
- + Vertical BoM file: MFG–MPN pairs are arranged by columns.
- + When the file is uploaded and moved to Step 2, the system will normalize and display it in a unified format:
- MFG1 | MPN1 | MFG2 | MPN2 | ...
- |_ Horizontal:
- + Horizontal BoM file: MFG–MPN pairs are arranged by rows.
- + When the file is uploaded and moved to Step 2, the system will also normalize it into the same unified display format:
- MFG1 | MPN1 | MFG2 | MPN2 | ...
- |_ Download template: Download vertical template, Download horizontal template (link)

Steps:
- 2.2. Choose option Load Existing BoM

Expected:
- Display
- |_ Assembly Info section
- |_ Assembly Part Number (dropdown, required)
- |_Description (textfield, auto-populate value based on the option chosen in Assembly Part Number)
- |_ BoM Version (textfield, auto-populate value based on the option chosen in Assembly Part Number)
- |_ Quantity (textfield, auto-populate value based on the option chosen in Assembly Part Number)
- |_ Part Class (textfield, auto-populate value based on the option chosen in Assembly Part Number)
- |_ Part Type (textfield, auto-populate value based on the option chosen in Assembly Part Number)
- |_ Component Info section
- |_ Upload file (button, required)
- |_ Customer Template
- |_ Create Customer Template (button, default disabled, enable when attach file via upload file)

Steps:
- 3. Enter all required data into the fields and import the BoM

Expected:
- All input fields are displayed.

Steps:
- 4. Click on the Next button

Expected:
- Show the Bill of Material form in Step 2 - Review BoM

Steps:
- 4.1. Assembly (Part Number + Rev + Customer) is duplicated.

Expected:
- Show error, can't process the next step

Steps:
- 4.2. Assembly (Part Number + Rev + Customer) isn't duplicated.

Expected:
- Proceed to step 2: Review BoM

Steps:
- 5. In Step 2 - Review BoM

Expected:
- Display all data from the file uploaded and the file parsed correctly following the ALM format chosen (Vertical / Horizontal)

Expected:
- File Reading & Parsing
- - Automatically add Customer Code prefix if missing (Assembly + Component)
- - Parse all fields correctly according to template

Expected:
- Component:
- - Part exists: display background color is green
- - Part doesn't exist: display background color is red
- MFG:
- - MFG exists: display background color is green
- - MFG doesn't exist: display background color is red

Expected:
- MFG Mapping:
- - All of the MFG have to:
- + Map with MFG is available
- + or Create new
- - Validate:
- +  Not enough maps yet: block submit + show error (Ex: Manufacturers don't exist: KEMETA)
- + Enough maps: allow submit BoM
- + {MFG-MPN} must be unique in every Part

Steps:
- 6. Action buttons:
- 6.1. Click on the Submit button

Expected:
- - If Part existed:
- |_ {MFG-MPN} existed -> skip
- |_ {MFG-MPN} doesn't exist -> create new mapping
- - If Part doesn't:
- |_ {MFG-MPN} existed -> create new part
- |_ {MFG-MPN} doesn't exist -> create new {MFG-MPN}
- - Note:
- |_ Didn't create the part that exists
- |_ Didn't create {MFG-MPN} that exists

Steps:
- 6.2. Click on the Previous button

Expected:
- Back to the previous step, that is Step 1 - Config BoM


## Master Data


## Note

- Historical RFQ thay vào đó:
- 1. duplicate record (clone)
- 2. tạo templates sẵn

