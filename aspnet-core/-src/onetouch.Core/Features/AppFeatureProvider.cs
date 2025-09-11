using Abp.Application.Features;
using Abp.Localization;
using Abp.Runtime.Validation;
using Abp.UI.Inputs;

namespace onetouch.Features
{
    public class AppFeatureProvider : FeatureProvider
    {
        public override void SetFeatures(IFeatureDefinitionContext context)
        {
            //MMT 09/21/2022  The text under "free edition" has to be reviewed[T-SII-20220830.0005][Start]
            //context.Create(
            //    AppFeatures.MaxUserCount,
            //    defaultValue: "0", //0 = unlimited
            //    displayName: L("MaximumUserCount"),
            //    description: L("MaximumUserCount_Description"),
            //    inputType: new SingleLineStringInputType(new NumericValueValidator(0, int.MaxValue))
            //)[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
            //{
            //    ValueTextNormalizer = value => value == "0" ? L("Unlimited") : new FixedLocalizableString(value),
            //    IsVisibleOnPricingTable = true
            //};
            //MMT 09/21/2022  The text under "free edition" has to be reviewed[T-SII-20220830.0005][End]
            #region ######## Example Features - You can delete them #########

            context.Create("TestTenantScopeFeature", "false", L("TestTenantScopeFeature"), scope: FeatureScopes.Tenant);
            context.Create("TestEditionScopeFeature", "false", L("TestEditionScopeFeature"), scope: FeatureScopes.Edition);
            //MMT 09/21/2022  The text under "free edition" has to be reviewed[T-SII-20220830.0005][Start]
            //context.Create(
            //    AppFeatures.TestCheckFeature,
            //    defaultValue: "false",
            //    displayName: L("TestCheckFeature"),
            //    inputType: new CheckboxInputType()
            //)[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
            //{
            //    IsVisibleOnPricingTable = true,
            //    TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
            //};

            //context.Create(
            //    AppFeatures.TestCheckFeature2,
            //    defaultValue: "true",
            //    displayName: L("TestCheckFeature2"),
            //    inputType: new CheckboxInputType()
            //)[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
            //{
            //    IsVisibleOnPricingTable = true,
            //    TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
            //};
            context.Create(
                      "CreateAndPublish",
                      defaultValue: "true",
                      displayName: L("CreateAndPublish"),
                      inputType: new CheckboxInputType()
                  )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
                  {
                      IsVisibleOnPricingTable = true,
                      TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
                  };

            context.Create(
                "SearchAccounts",
                defaultValue: "true",
                displayName: L("SearchAccounts"),
                inputType: new CheckboxInputType()
            )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
            {
                IsVisibleOnPricingTable = true,
                TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
            };

            context.Create(
              "EasySearch",
              defaultValue: "true",
              displayName: L("EasySearch"),
              inputType: new CheckboxInputType()
          )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
          {
              IsVisibleOnPricingTable = true,
              TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
          };

            context.Create(
                "PromoteProducts",
                defaultValue: "true",
                displayName: L("PromoteProducts"),
                inputType: new CheckboxInputType()
            )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
            {
                IsVisibleOnPricingTable = true,
                TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
            };
            
           
            context.Create(
           "InvitePartners",
           defaultValue: "true",
           displayName: L("InvitePartners"),
           inputType: new CheckboxInputType()
       )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
       {
           IsVisibleOnPricingTable = true,
           TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
       };
            
            context.Create(
                   "CreateProductList",
                   defaultValue: "true",
                   displayName: L("CreateProductList"),
                   inputType: new CheckboxInputType()
               )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
               {
                   IsVisibleOnPricingTable = true,
                   TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
               };

          
            context.Create(
                 "SIIWIINews",
                 defaultValue: "true",
                 displayName: L("SIIWIINews"),
                 inputType: new CheckboxInputType()
             )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
             {
                 IsVisibleOnPricingTable = true,
                 TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
             };

            context.Create(
                 "IndustryEventPage",
                 defaultValue: "true",
                 displayName: L("IndustryEventPage"),
                 inputType: new CheckboxInputType()
             )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
             {
                 IsVisibleOnPricingTable = true,
                 TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
             };


            context.Create(
                 "CreateEvent",
                 defaultValue: "true",
                 displayName: L("CreateEvent"),
                 inputType: new CheckboxInputType()
             )[FeatureMetadata.CustomFeatureKey] = new FeatureMetadata
             {
                 IsVisibleOnPricingTable = true,
                 TextHtmlColor = value => value == "true" ? "#5cb85c" : "#d9534f"
             };
            //MMT 09/21/2022  The text under "free edition" has to be reviewed[T-SII-20220830.0005][End]
            
            #endregion

            var chatFeature = context.Create(
                AppFeatures.ChatFeature,
                defaultValue: "false",
                displayName: L("ChatFeature"),
                inputType: new CheckboxInputType()
            );

            chatFeature.CreateChildFeature(
                AppFeatures.TenantToTenantChatFeature,
                defaultValue: "false",
                displayName: L("TenantToTenantChatFeature"),
                inputType: new CheckboxInputType()
            );

            chatFeature.CreateChildFeature(
                AppFeatures.TenantToHostChatFeature,
                defaultValue: "false",
                displayName: L("TenantToHostChatFeature"),
                inputType: new CheckboxInputType()
            );
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, onetouchConsts.LocalizationSourceName);
        }
    }
}
