package com.project.ChatApp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final OAuth2UserProvisioner oauth2UserProvisioner;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        try {
            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            oauth2UserProvisioner.saveOrUpdateUser(registrationId, oidcUser.getAttributes());
        } catch (Exception e) {
            log.error("Error provisioning OIDC user: ", e);
            throw new OAuth2AuthenticationException("User provisioning failed: " + e.getMessage());
        }
        return oidcUser;
    }
}
