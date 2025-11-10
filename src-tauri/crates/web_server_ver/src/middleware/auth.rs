pub enum UserRole {
    None,
    Admin,
    SuperAdmin,
}

pub struct AuthenticatedUserData {
    pub email: String,
    pub role: UserRole,
}

pub struct AuthenticatedUser {
    pub data: AuthenticatedUserData,
}
pub struct AuthenticatedAdminUser {
    pub data: AuthenticatedUserData,
}
pub struct AuthenticatedSuperAdminUser {
    pub data: AuthenticatedUserData,
}

impl AuthenticatedUser {
    pub fn is_admin_type(&self) -> bool {
        return matches!(self.data.role, UserRole::Admin)
            || matches!(self.data.role, UserRole::SuperAdmin);
    }
}
#[rocket::async_trait]
impl<'r> rocket::request::FromRequest<'r> for AuthenticatedUser {
    type Error = ();

    /// TODO: implement
    async fn from_request(
        req: &'r rocket::Request<'_>,
    ) -> rocket::request::Outcome<Self, Self::Error> {
        rocket::request::Outcome::Error((rocket::http::Status::Unauthorized, ()))
    }
}

#[rocket::async_trait]
impl<'r> rocket::request::FromRequest<'r> for AuthenticatedAdminUser {
    type Error = ();

    /// TODO: implement
    async fn from_request(
        req: &'r rocket::Request<'_>,
    ) -> rocket::request::Outcome<Self, Self::Error> {
        rocket::request::Outcome::Error((rocket::http::Status::Unauthorized, ()))
    }
}

#[rocket::async_trait]
impl<'r> rocket::request::FromRequest<'r> for AuthenticatedSuperAdminUser {
    type Error = ();

    /// TODO: implement
    async fn from_request(
        req: &'r rocket::Request<'_>,
    ) -> rocket::request::Outcome<Self, Self::Error> {
        rocket::request::Outcome::Error((rocket::http::Status::Unauthorized, ()))
    }
}
