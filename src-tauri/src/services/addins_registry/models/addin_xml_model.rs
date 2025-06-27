use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

/// Represents a single Revit AddIn entry in the XML file
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct AddIn {
    /// The name of the addin
    pub name: Option<String>,
    /// The assembly path relative to the addin folder
    pub assembly: Option<String>,
    /// The unique identifier for the addin
    #[serde(rename = "AddInId")]
    pub addin_id: Option<String>,
    /// The full class name of the addin
    pub full_class_name: Option<String>,
    /// The vendor ID
    pub vendor_id: Option<String>,
    /// The vendor description
    pub vendor_description: Option<String>,
    /// The vendor email
    pub vendor_email: Option<String>,
    /// The type of addin (Application, Command, etc.)
    #[serde(rename = "@Type")]
    pub addin_type: Option<String>,
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
        assert_eq!(addin.name, Some("revitnextjs".to_string()));
        assert_eq!(
            addin.assembly,
            Some("RevitNextJs\\RevitNextJs.dll".to_string())
        );
        assert_eq!(
            addin.addin_id,
            Some("86f6bbab-c9af-4e53-86d6-0ea571d3bebe".to_string())
        );
        assert_eq!(addin.full_class_name, Some("RevitNextJs.App".to_string()));
        assert_eq!(addin.vendor_id, Some("Development".to_string()));
        assert_eq!(
            addin.vendor_description,
            Some("Adds Nextjs support".to_string())
        );
        assert_eq!(
            addin.vendor_email,
            Some("graysonr12@icloud.com".to_string())
        );
        assert_eq!(addin.addin_type, Some("Application".to_string()));
    }

    #[test]
    fn test_serialize_xml() {
        let addin = AddIn {
            name: Some("test_addin".to_string()),
            assembly: Some("Test\\Test.dll".to_string()),
            addin_id: Some("test-id".to_string()),
            full_class_name: Some("Test.App".to_string()),
            vendor_id: Some("TestVendor".to_string()),
            vendor_description: Some("Test Description".to_string()),
            vendor_email: Some("test@example.com".to_string()),
            addin_type: Some("Application".to_string()),
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
