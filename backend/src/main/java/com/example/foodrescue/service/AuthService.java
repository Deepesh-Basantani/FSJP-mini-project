package com.example.foodrescue.service;

import com.example.foodrescue.dto.*;
import com.example.foodrescue.entity.Role;
import com.example.foodrescue.entity.User;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.UserRepository;
import com.example.foodrescue.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email is already registered: " + req.getEmail());
        }

        User user = new User(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getRole(),
                req.getPhone(),
                req.getOrganisationName()
        );

        User saved = userRepository.save(user);
        auditService.recordStatusChange("USER", saved.getId(), null, "REGISTERED", saved, "New account registered as " + saved.getRole());

        String token = tokenProvider.generateTokenForUsername(saved.getEmail(), saved.getId());
        return new AuthResponse(token, UserResponse.fromEntity(saved));
    }

    public AuthResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Account has been deactivated. Please contact support.");
        }

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(req.getName());
        user.setPhone(req.getPhone());
        user.setOrganisationName(req.getOrganisationName());

        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        auditService.recordStatusChange("USER", user.getId(), "ACTIVE", "PASSWORD_CHANGED", user, "Password updated securely");
    }
}
