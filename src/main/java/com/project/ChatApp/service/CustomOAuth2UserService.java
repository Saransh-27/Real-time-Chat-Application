package com.project.ChatApp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final OAuth2UserProvisioner oauth2UserProvisioner;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            oauth2UserProvisioner.saveOrUpdateUser(registrationId, oAuth2User.getAttributes());
        } catch (Exception e) {
            log.error("Error provisioning OAuth2 user: ", e);
            throw new OAuth2AuthenticationException("User provisioning failed: " + e.getMessage());
        }
        return oAuth2User;
    }
}

