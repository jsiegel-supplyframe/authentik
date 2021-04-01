import { CryptoApi, FlowDesignationEnum, FlowsApi, SAMLProvider, ProvidersApi, PropertymappingsApi,  SAMLProviderSpBindingEnum, SAMLProviderDigestAlgorithmEnum, SAMLProviderSignatureAlgorithmEnum } from "authentik-api";
import { gettext } from "django";
import { customElement, property } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { DEFAULT_CONFIG } from "../../../api/Config";
import { Form } from "../../../elements/forms/Form";
import { until } from "lit-html/directives/until";
import { ifDefined } from "lit-html/directives/if-defined";
import "../../../elements/forms/HorizontalFormElement";

@customElement("ak-provider-saml-form")
export class SAMLProviderFormPage extends Form<SAMLProvider> {

    set providerUUID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG).providersSamlRead({
            id: value,
        }).then(provider => {
            this.provider = provider;
        });
    }

    @property({attribute: false})
    provider?: SAMLProvider;

    getSuccessMessage(): string {
        if (this.provider) {
            return gettext("Successfully updated provider.");
        } else {
            return gettext("Successfully created provider.");
        }
    }

    send = (data: SAMLProvider): Promise<SAMLProvider> => {
        if (this.provider) {
            return new ProvidersApi(DEFAULT_CONFIG).providersSamlUpdate({
                id: this.provider.pk || 0,
                data: data
            });
        } else {
            return new ProvidersApi(DEFAULT_CONFIG).providersSamlCreate({
                data: data
            });
        }
    };

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <ak-form-element-horizontal
                label=${gettext("Name")}
                ?required=${true}
                name="name">
                <input type="text" value="${ifDefined(this.provider?.name)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Authorization flow")}
                ?required=${true}
                name="authorizationFlow">
                <select class="pf-c-form-control">
                    ${until(new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                        ordering: "pk",
                        designation: FlowDesignationEnum.Authorization,
                    }).then(flows => {
                        return flows.results.map(flow => {
                            return html`<option value=${ifDefined(flow.pk)} ?selected=${this.provider?.authorizationFlow === flow.pk}>${flow.name}</option>`;
                        });
                    }))}
                </select>
                <p class="pf-c-form__helper-text">${gettext("Flow used when authorizing this provider.")}</p>
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("ACS URL")}
                ?required=${true}
                name="acsUrl">
                <input type="text" value="${ifDefined(this.provider?.acsUrl)}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Issuer")}
                ?required=${true}
                name="issuer">
                <input type="text" value="${this.provider?.issuer || "authentik"}" class="pf-c-form-control" required>
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("Service Provider Binding")}
                ?required=${true}
                name="spBinding">
                <select class="pf-c-form-control">
                    <option value=${SAMLProviderSpBindingEnum.Redirect} ?selected=${this.provider?.spBinding === SAMLProviderSpBindingEnum.Redirect}>
                        ${gettext("Redirect")}
                    </option>
                    <option value=${SAMLProviderSpBindingEnum.Post} ?selected=${this.provider?.spBinding === SAMLProviderSpBindingEnum.Post}>
                        ${gettext("Post")}
                    </option>
                </select>
                <p class="pf-c-form__helper-text">${gettext("Determines how authentik sends the response back to the Service Provider.")}</p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Audience")}
                name="audience">
                <input type="text" value="${ifDefined(this.provider?.audience)}" class="pf-c-form-control">
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("Signing Keypair")}
                name="signingKp">
                <select class="pf-c-form-control">
                    <option value="" ?selected=${this.provider?.signingKp === undefined}>---------</option>
                    ${until(new CryptoApi(DEFAULT_CONFIG).cryptoCertificatekeypairsList({
                        ordering: "pk",
                        hasKey: "true",
                    }).then(keys => {
                        return keys.results.map(key => {
                            return html`<option value=${ifDefined(key.pk)} ?selected=${this.provider?.signingKp === key.pk}>${key.name}</option>`;
                        });
                    }))}
                </select>
                <p class="pf-c-form__helper-text">${gettext("Keypair used to sign outgoing Responses going to the Service Provider.")}</p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Verification Certificate")}
                ?required=${true}
                name="verificationKp">
                <select class="pf-c-form-control">
                    <option value="" ?selected=${this.provider?.verificationKp === undefined}>---------</option>
                    ${until(new CryptoApi(DEFAULT_CONFIG).cryptoCertificatekeypairsList({
                        ordering: "pk",
                    }).then(keys => {
                        return keys.results.map(key => {
                            return html`<option value=${ifDefined(key.pk)} ?selected=${this.provider?.verificationKp === key.pk}>${key.name}</option>`;
                        });
                    }))}
                </select>
                <p class="pf-c-form__helper-text">${gettext("When selected, incoming assertion's Signatures will be validated against this certificate. To allow unsigned Requests, leave on default.")}</p>
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("Property mappings")}
                ?required=${true}
                name="propertyMappings">
                <select class="pf-c-form-control" multiple>
                    ${until(new PropertymappingsApi(DEFAULT_CONFIG).propertymappingsSamlList({
                        ordering: "saml_name"
                    }).then(mappings => {
                        return mappings.results.map(mapping => {
                            const selected = Array.from(this.provider?.propertyMappings || []).some(su => {
                                return su == mapping.pk;
                            });
                            return html`<option value=${ifDefined(mapping.pk)} ?selected=${selected}>${mapping.name}</option>`;
                        });
                    }))}
                </select>
                <p class="pf-c-form__helper-text">${gettext("Hold control/command to select multiple items.")}</p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("NameID Property Mapping")}
                name="nameIdMapping">
                <select class="pf-c-form-control">
                    <option value="" ?selected=${this.provider?.nameIdMapping === undefined}>---------</option>
                    ${until(new PropertymappingsApi(DEFAULT_CONFIG).propertymappingsSamlList({
                        ordering: "saml_name"
                    }).then(mappings => {
                        return mappings.results.map(mapping => {
                            return html`<option value=${ifDefined(mapping.pk)} ?selected=${this.provider?.nameIdMapping === mapping.pk}>${mapping.name}</option>`;
                        });
                    }))}
                </select>
                <p class="pf-c-form__helper-text">${gettext("Configure how the NameID value will be created. When left empty, the NameIDPolicy of the incoming request will be respected.")}</p>
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("Assertion valid not before")}
                ?required=${true}
                name="assertionValidNotBefore">
                <input type="text" value="${this.provider?.assertionValidNotBefore || "minutes=-5"}" class="pf-c-form-control" required>
                <p class="pf-c-form__helper-text">${gettext("Assertion valid not before current time + this value (Format: hours=-1;minutes=-2;seconds=-3).")}</p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Assertion valid not on or after")}
                ?required=${true}
                name="assertionValidNotOnOrAfter">
                <input type="text" value="${this.provider?.assertionValidNotOnOrAfter || "minutes=5"}" class="pf-c-form-control" required>
                <p class="pf-c-form__helper-text">${gettext("Assertion not valid on or after current time + this value (Format: hours=1;minutes=2;seconds=3).")}</p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Session valid not on or after")}
                ?required=${true}
                name="sessionValidNotOnOrAfter">
                <input type="text" value="${this.provider?.sessionValidNotOnOrAfter || "minutes=86400"}" class="pf-c-form-control" required>
                <p class="pf-c-form__helper-text">${gettext("Session not valid on or after current time + this value (Format: hours=1;minutes=2;seconds=3).")}</p>
            </ak-form-element-horizontal>

            <ak-form-element-horizontal
                label=${gettext("Digest algorithm")}
                ?required=${true}
                name="digestAlgorithm">
                <select class="pf-c-form-control">
                    <option value=${SAMLProviderDigestAlgorithmEnum._200009Xmldsigsha1} ?selected=${this.provider?.digestAlgorithm === SAMLProviderDigestAlgorithmEnum._200009Xmldsigsha1}>
                        ${gettext("SHA1")}
                    </option>
                    <option value=${SAMLProviderDigestAlgorithmEnum._200104Xmlencsha256} ?selected=${this.provider?.digestAlgorithm === SAMLProviderDigestAlgorithmEnum._200104Xmlencsha256 || this.provider?.digestAlgorithm === undefined}>
                        ${gettext("SHA256")}
                    </option>
                    <option value=${SAMLProviderDigestAlgorithmEnum._200104XmldsigMoresha384} ?selected=${this.provider?.digestAlgorithm === SAMLProviderDigestAlgorithmEnum._200104XmldsigMoresha384}>
                        ${gettext("SHA384")}
                    </option>
                    <option value=${SAMLProviderDigestAlgorithmEnum._200104Xmlencsha512} ?selected=${this.provider?.digestAlgorithm === SAMLProviderDigestAlgorithmEnum._200104Xmlencsha512}>
                        ${gettext("SHA512")}
                    </option>
                </select>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${gettext("Signature algorithm")}
                ?required=${true}
                name="signatureAlgorithm">
                <select class="pf-c-form-control">
                    <option value=${SAMLProviderSignatureAlgorithmEnum._200009XmldsigrsaSha1} ?selected=${this.provider?.signatureAlgorithm === SAMLProviderSignatureAlgorithmEnum._200009XmldsigrsaSha1}>
                        ${gettext("RSA-SHA1")}
                    </option>
                    <option value=${SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha256} ?selected=${this.provider?.signatureAlgorithm === SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha256 || this.provider?.signatureAlgorithm === undefined}>
                        ${gettext("RSA-SHA256")}
                    </option>
                    <option value=${SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha384} ?selected=${this.provider?.signatureAlgorithm === SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha384}>
                        ${gettext("RSA-SHA384")}
                    </option>
                    <option value=${SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha512} ?selected=${this.provider?.signatureAlgorithm === SAMLProviderSignatureAlgorithmEnum._200104XmldsigMorersaSha512}>
                        ${gettext("RSA-SHA512")}
                    </option>
                    <option value=${SAMLProviderSignatureAlgorithmEnum._200009XmldsigdsaSha1} ?selected=${this.provider?.signatureAlgorithm === SAMLProviderSignatureAlgorithmEnum._200009XmldsigdsaSha1}>
                        ${gettext("DSA-SHA1")}
                    </option>
                </select>
            </ak-form-element-horizontal>
        </form>`;
    }

}
