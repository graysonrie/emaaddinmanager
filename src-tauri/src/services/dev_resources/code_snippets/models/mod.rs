use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CodeSnippetModel {
    /// Not for the user to modify, only for the program
    pub code_snippet_version: String,
    /// Arbitrary json:
    pub metadata: Option<serde_json::Value>,
    pub name: String,
    pub code: String,
    pub description: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FrontendCodeSnippetModel {
    /// Arbitrary json:
    pub metadata: Option<serde_json::Value>,
    pub name: String,
    pub code: String,
    pub description: String,
    pub language: String,
    pub nested_paths: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CodeSnippetsAndGroupsModel {
    pub code_snippets: Vec<FrontendCodeSnippetModel>,
    pub groups: Vec<String>,
}
