class UserDto {
  firstName;
  lastName;
  userName;
  email;
  profilePhoto;
  description;
  location;
  followersCount;
  followingCount;
  constructor(user) {
    (this.firstName = user?.firstName),
      (this.lastName = user?.lastName),
      (this.userName = user?.userName),
      (this.email = user?.email);
    this.profilePhoto = user?.profilePhoto;
    this.description = user?.description;
    this.location = user?.location;
    this.followersCount = user?.followersCount;
    this.followingCount = user?.followingCount;
  }
}

module.exports = UserDto;
