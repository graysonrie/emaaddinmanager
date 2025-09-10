use std::path::Path;

mod csharp;
mod no_window_cmd;

fn main() {
    let template_file =
        "S:\\BasesRevitAddinsRegistry\\DevResources\\VSTemplates\\unzipped\\RevitAddinTemplate";
    if let Err(e) = csharp::project_creator::install_template(template_file) {
        println!("Warning: Error installing template: {}", e);
    }
    let out_dir = "C:\\Users\\grieger.EMA\\Desktop\\Csharp\\Templates";
    let out_dir = Path::new(out_dir);
    csharp::project_creator::generate_project("revitaddin", "TestAddin", out_dir, &[]).unwrap();

    println!("Hello, world!");
}
