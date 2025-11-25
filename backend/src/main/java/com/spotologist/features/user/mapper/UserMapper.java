package com.spotologist.features.user.mapper;

import com.spotologist.features.user.model.User;
import com.spotologist.features.user.model.UserDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
}
