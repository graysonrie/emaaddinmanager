use std::collections::{BTreeSet, HashSet};

use serde_json::{Map, Value};

pub fn published_addins_count(value: &Value) -> usize {
    value.as_array().map(Vec::len).unwrap_or(0)
}

/// Count installed addins distinct by `addin.name`.
///
/// Missing and JSON null names collapse to a single bucket, matching the
/// client's dedupe and the Python server's set of names.
pub fn distinct_installed_count(installed_addins: &Value) -> usize {
    let Some(entries) = installed_addins.as_array() else {
        return 0;
    };

    let mut names = HashSet::new();
    for entry in entries {
        let Some(entry) = entry.as_object() else {
            continue;
        };
        let Some(addin) = entry.get("addin").and_then(Value::as_object) else {
            continue;
        };
        names.insert(name_key(addin));
    }
    names.len()
}

fn name_key(addin: &Map<String, Value>) -> Option<String> {
    match addin.get("name") {
        None | Some(Value::Null) => None,
        Some(Value::String(name)) => Some(name.clone()),
        Some(other) => Some(other.to_string()),
    }
}

pub fn app_version_from_metadata(metadata: Option<&Value>) -> Option<String> {
    let object = metadata?.as_object()?;
    match object.get("appVersion") {
        Some(Value::String(version)) => Some(version.clone()),
        _ => None,
    }
}

pub fn clean_paths(paths: Vec<String>) -> Vec<String> {
    paths
        .into_iter()
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect()
}

pub fn json_string_list(value: &Value) -> Vec<String> {
    value
        .as_array()
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.as_str().map(str::to_string))
                .collect()
        })
        .unwrap_or_default()
}

pub fn string_list_to_json(paths: &[String]) -> Value {
    Value::Array(paths.iter().cloned().map(Value::String).collect())
}

/// Returns the sorted unique list when `path` was not already blocked.
pub fn block_path(existing: &[String], path: &str) -> Option<Vec<String>> {
    if existing.iter().any(|item| item == path) {
        return None;
    }
    let mut next: Vec<String> = existing
        .iter()
        .cloned()
        .chain(std::iter::once(path.to_string()))
        .collect();
    next.sort();
    next.dedup();
    Some(next)
}

/// Returns the list with `path` removed, preserving the remaining order.
pub fn unblock_path(existing: &[String], path: &str) -> Option<Vec<String>> {
    if !existing.iter().any(|item| item == path) {
        return None;
    }
    Some(
        existing
            .iter()
            .filter(|item| item.as_str() != path)
            .cloned()
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn published_count_ignores_non_arrays() {
        assert_eq!(published_addins_count(&json!(["a", "b"])), 2);
        assert_eq!(published_addins_count(&json!({})), 0);
    }

    #[test]
    fn installed_count_is_distinct_by_name() {
        let installed = json!([
            {"addin": {"name": "Alpha"}},
            {"addin": {"name": "Alpha"}},
            {"addin": {"name": "Beta"}},
            {"addin": {}},
            {"addin": {"name": null}},
            "skip-me"
        ]);
        assert_eq!(distinct_installed_count(&installed), 3);
        assert_eq!(distinct_installed_count(&json!({})), 0);
    }

    #[test]
    fn app_version_reads_camel_case_string() {
        assert_eq!(
            app_version_from_metadata(Some(&json!({"appVersion": "1.2.3"}))),
            Some("1.2.3".to_string())
        );
        assert_eq!(
            app_version_from_metadata(Some(&json!({"appVersion": null}))),
            None
        );
        assert_eq!(app_version_from_metadata(None), None);
    }

    #[test]
    fn paths_are_sorted_and_deduped() {
        assert_eq!(
            clean_paths(vec!["b".into(), "a".into(), "b".into()]),
            vec!["a".to_string(), "b".to_string()]
        );
    }

    #[test]
    fn block_and_unblock_paths() {
        assert_eq!(
            block_path(&["b".into()], "a").as_deref(),
            Some(["a".to_string(), "b".to_string()].as_slice())
        );
        assert_eq!(block_path(&["a".into()], "a"), None);
        assert_eq!(
            unblock_path(&["c".into(), "a".into(), "b".into()], "a").as_deref(),
            Some(["c".to_string(), "b".to_string()].as_slice())
        );
        assert_eq!(unblock_path(&["c".into()], "a"), None);
    }
}
