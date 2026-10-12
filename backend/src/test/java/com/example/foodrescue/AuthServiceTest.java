package com.example.foodrescue;

import com.example.foodrescue.dto.RegisterRequest;
import com.example.foodrescue.entity.Role;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.repository.UserRepository;
import com.example.foodrescue.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Reject duplicate email on registration")
    void testDuplicateEmailRegistration() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@bistro.com");
        req.setName("Test Provider");
        req.setPassword("secret123");
        req.setRole(Role.FOOD_PROVIDER);

        when(userRepository.existsByEmail("existing@bistro.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () ->
                authService.register(req)
        );
    }
}
