use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

/// Represents a single Revit AddIn entry in the XML file
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct AddIn {
    /// The name of the addin
    pub name: String,
    /// The assembly path relative to the addin folder
    pub assembly: String,
    /// The unique identifier for the addin
    #[serde(rename = "AddInId")]
    pub addin_id: String,
    /// The full class name of the addin
    pub full_class_name: String,
    /// The vendor ID
    pub vendor_id: String,
    /// The vendor description
    pub vendor_description: String,
    /// The vendor email
    pub vendor_email: String,
    /// The type of addin (Application, Command, etc.)
    #[serde(rename = "@Type")]
    pub addin_type: String,
}

/// Represents the root RevitAddIns element containing all addins
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct RevitAddIns {
    /// Vector of all addins in the file
    pub add_in: Vec<AddIn>,
}

impl RevitAddIns {
    /// Deserialize an XML file into a RevitAddIns struct
    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self, Box<dyn std::error::Error>> {
        let content = fs::read_to_string(path)?;
        Self::from_xml(&content)
    }

    /// Deserialize XML string into a RevitAddIns struct
    pub fn from_xml(xml_content: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let addins: RevitAddIns = quick_xml::de::from_str(xml_content)?;
        Ok(addins)
    }

    /// Serialize the RevitAddIns struct back to XML string
    pub fn to_xml(&self) -> Result<String, Box<dyn std::error::Error>> {
        let xml = quick_xml::se::to_string(self)?;
        Ok(format!(
            "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n{}",
            xml
        ))
    }

    /// Save the RevitAddIns struct to an XML file
    pub fn save_to_file<P: AsRef<Path>>(&self, path: P) -> Result<(), Box<dyn std::error::Error>> {
        let xml_content = self.to_xml()?;
        fs::write(path, xml_content)?;
        Ok(())
    }

    /// Get all addins of a specific type
    pub fn get_addins_by_type(&self, addin_type: &str) -> Vec<&AddIn> {
        self.add_in
            .iter()
            .filter(|addin| addin.addin_type == addin_type)
            .collect()
    }

    /// Get an addin by its ID
    pub fn get_addin_by_id(&self, addin_id: &str) -> Option<&AddIn> {
        self.add_in.iter().find(|addin| addin.addin_id == addin_id)
    }

    /// Get an addin by its name
    pub fn get_addin_by_name(&self, name: &str) -> Option<&AddIn> {
        self.add_in.iter().find(|addin| addin.name == name)
    }
}

impl AddIn {
    /// Get the assembly path as a Path
    pub fn assembly_path(&self) -> std::path::PathBuf {
        std::path::PathBuf::from(&self.assembly)
    }

    /// Check if this is an Application type addin
    pub fn is_application(&self) -> bool {
        self.addin_type == "Application"
    }

    /// Check if this is a Command type addin
    pub fn is_command(&self) -> bool {
        self.addin_type == "Command"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_xml() {
        let xml_content = r#"<?xml version="1.0" encoding="utf-8"?>
<RevitAddIns>
    <AddIn Type="Application">
        <Name>revitnextjs</Name>
        <Assembly>RevitNextJs\RevitNextJs.dll</Assembly>
        <AddInId>86f6bbab-c9af-4e53-86d6-0ea571d3bebe</AddInId>
        <FullClassName>RevitNextJs.App</FullClassName>
        <VendorId>Development</VendorId>
        <VendorDescription>Adds Nextjs support</VendorDescription>
        <VendorEmail>graysonr12@icloud.com</VendorEmail>
    </AddIn>
</RevitAddIns>"#;

        let result = RevitAddIns::from_xml(xml_content);
        if let Err(ref e) = result {
            println!("Deserialization error: {}", e);
        }
        assert!(result.is_ok());

        let addins = result.unwrap();
        assert_eq!(addins.add_in.len(), 1);

        let addin = &addins.add_in[0];
        assert_eq!(addin.name, "revitnextjs");
        assert_eq!(addin.assembly, "RevitNextJs\\RevitNextJs.dll");
        assert_eq!(addin.addin_id, "86f6bbab-c9af-4e53-86d6-0ea571d3bebe");
        assert_eq!(addin.full_class_name, "RevitNextJs.App");
        assert_eq!(addin.vendor_id, "Development");
        assert_eq!(addin.vendor_description, "Adds Nextjs support");
        assert_eq!(addin.vendor_email, "graysonr12@icloud.com");
        assert_eq!(addin.addin_type, "Application");
    }

    #[test]
    fn test_serialize_xml() {
        let addin = AddIn {
            name: "test_addin".to_string(),
            assembly: "Test\\Test.dll".to_string(),
            addin_id: "test-id".to_string(),
            full_class_name: "Test.App".to_string(),
            vendor_id: "TestVendor".to_string(),
            vendor_description: "Test Description".to_string(),
            vendor_email: "test@example.com".to_string(),
            addin_type: "Application".to_string(),
        };

        let addins = RevitAddIns {
            add_in: vec![addin],
        };

        let xml = addins.to_xml().unwrap();
        assert!(xml.contains("test_addin"));
        assert!(xml.contains("Test\\Test.dll"));
        assert!(xml.contains("test-id"));
    }
}
