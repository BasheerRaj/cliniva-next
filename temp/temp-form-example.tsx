import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
  } from "lucide-react";
  import React, { useState } from "react";
  import { Button } from "../../../../components/ui/button";
  import { Card, CardContent } from "../../../../components/ui/card";
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "../../../../components/ui/collapsible";
  import { Input } from "../../../../components/ui/input";
  import { Textarea } from "../../../../components/ui/textarea";
  
  const formFields = [
    {
      id: "logo",
      label: "Logo*",
      type: "upload",
      gridArea: "logo",
      position: { top: "top-6", left: "left-6" },
    },
    {
      id: "companyName",
      label: "Company Name*",
      type: "input-group",
      gridArea: "companyName",
      position: { top: "top-8", left: "left-[621px]" },
      fields: [
        { placeholder: "Enter Trade Name" },
        { placeholder: "Enter Legal Name" },
      ],
    },
    {
      id: "yearEstablishment",
      label: "Year of Establishment",
      type: "date",
      gridArea: "yearEstablishment",
      position: { top: "top-28", left: "left-6" },
    },
    {
      id: "ceoName",
      label: "CEO Name*",
      type: "input",
      gridArea: "ceoName",
      position: { top: "top-[363px]", left: "left-[621px]" },
      placeholder: "Enter Name",
    },
  ];
  
  const overviewFields = [
    {
      id: "overview",
      label: "Overview",
      type: "textarea",
      placeholder: "Enter Overview",
      position: { top: "top-60", left: "left-6" },
    },
    {
      id: "vision",
      label: "Vision",
      type: "textarea",
      placeholder: "Enter Vision",
      position: { top: "top-60", left: "left-[621px]" },
    },
    {
      id: "goals",
      label: "Goals",
      type: "textarea",
      placeholder: "Enter Goals",
      position: { top: "top-[346px]", left: "left-6" },
    },
  ];
  
  export const CompanyDetailsSection = (): JSX.Element => {
    const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  
    return (
      <div className="flex flex-col items-start gap-4 pl-0 pr-5 py-4 relative flex-1 self-stretch grow">
        <div className="flex flex-col items-start justify-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center justify-between pl-1 pr-0 py-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col w-[340px] items-start gap-1.5 px-0 py-0.5 relative">
              <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
                <ArrowLeftIcon className="relative w-4 h-4" />
                <div className="relative w-fit mt-[-1.00px] font-title-12px-regular font-[number:var(--title-12px-regular-font-weight)] text-on-surface-secondary text-[length:var(--title-12px-regular-font-size)] tracking-[var(--title-12px-regular-letter-spacing)] leading-[var(--title-12px-regular-line-height)] whitespace-nowrap [font-style:var(--title-12px-regular-font-style)]">
                  Back to Choosing Plan Page
                </div>
              </div>
              <div className="self-stretch text-[length:var(--h5-22px-bold-font-size)] leading-[var(--h5-22px-bold-line-height)] relative font-h5-22px-bold font-[number:var(--h5-22px-bold-font-weight)] text-on-surface-primary tracking-[var(--h5-22px-bold-letter-spacing)] [font-style:var(--h5-22px-bold-font-style)]">
                Fill in Company Details
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex-1 mt-[-1.00px] text-[length:var(--title-14px-semibold-font-size)] leading-[var(--title-14px-semibold-line-height)] relative font-title-14px-semibold font-[number:var(--title-14px-semibold-font-weight)] text-on-surface-primary tracking-[var(--title-14px-semibold-letter-spacing)] [font-style:var(--title-14px-semibold-font-style)]">
              Company Overview
            </div>
          </div>
        </div>
  
        <Card className="relative self-stretch w-full h-[902px] bg-bg-subtle rounded-2xl overflow-hidden border-0">
          <CardContent className="p-0 relative w-full h-full">
            {formFields.map((field) => (
              <div
                key={field.id}
                className={`inline-flex items-center gap-8 absolute ${field.position.top} ${field.position.left}`}
              >
                <div className="relative w-40 [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                  {field.label}
                </div>
  
                {field.type === "upload" && (
                  <div className="flex w-[360px] items-center gap-[8.19px] relative">
                    <div className="flex flex-col w-[360px] h-16 items-start gap-2 relative rounded">
                      <div className="flex flex-col w-[360px] h-16 items-center justify-center gap-5 px-0 py-4 relative bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                        <div className="flex items-center justify-center gap-[8.19px] relative self-stretch w-full flex-[0_0_auto] mt-[-8.00px] mb-[-8.00px]">
                          <img
                            className="relative w-[30.71px] h-[30.71px]"
                            alt="Image plus"
                            src="/image-plus.svg"
                          />
                          <div className="flex flex-col w-[289px] items-start gap-2 relative">
                            <div className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-on-surface-primary text-sm text-center tracking-[0] leading-[21px]">
                              <span className="text-[#69a3e9]">
                                Click or Drag
                              </span>
                              <span className="text-[#414651]">
                                {" "}
                                file to this area to upload
                              </span>
                            </div>
                            <div className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-on-surface-secondary text-xs text-center tracking-[0] leading-[18.4px]">
                              SVG, PNG, JPG or GIF , Maximum file size 2MB.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
  
                {field.type === "input-group" && (
                  <div className="flex flex-col w-[360px] items-start gap-6 relative">
                    {field.fields?.map((inputField, index) => (
                      <Input
                        key={index}
                        className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                        placeholder={inputField.placeholder}
                      />
                    ))}
                  </div>
                )}
  
                {field.type === "date" && (
                  <div className="flex flex-col w-[360px] h-12 items-center justify-center px-4 py-2 relative bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                    <div className="flex items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
                      <div className="flex items-center relative flex-1 grow">
                        <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-on-surface-secondary text-base tracking-[0] leading-6 whitespace-nowrap">
                          Select Date
                        </div>
                      </div>
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                )}
  
                {field.type === "input" && (
                  <div className="flex w-[360px] items-center gap-4 relative self-stretch">
                    <Input
                      className="flex-1 grow flex items-center px-4 py-2 relative self-stretch bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                      placeholder={field.placeholder}
                    />
                  </div>
                )}
              </div>
            ))}
  
            <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex w-[1149px] items-center justify-between absolute top-[184px] left-6 cursor-pointer">
                  <div className="relative w-fit font-title-18px-semibold font-[number:var(--title-18px-semibold-font-weight)] text-[#000000] text-[length:var(--title-18px-semibold-font-size)] tracking-[var(--title-18px-semibold-letter-spacing)] leading-[var(--title-18px-semibold-line-height)] whitespace-nowrap [font-style:var(--title-18px-semibold-font-style)]">
                    Company Overview
                  </div>
                  {isOverviewOpen ? (
                    <ChevronUpIcon className="relative w-8 h-8" />
                  ) : (
                    <ChevronDownIcon className="relative w-8 h-8" />
                  )}
                </div>
              </CollapsibleTrigger>
  
              <CollapsibleContent>
                {overviewFields.map((field) => (
                  <div
                    key={field.id}
                    className={`inline-flex items-start gap-8 absolute ${field.position.top} ${field.position.left}`}
                  >
                    <div className="relative w-40 [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      {field.label}
                    </div>
                    <div className="flex flex-col w-[360px] items-start relative">
                      <div className="flex flex-col items-start px-4 py-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                        <Textarea
                          className="relative self-stretch h-16 [font-family:'Lato',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 border-0 p-0 resize-none"
                          placeholder={field.placeholder}
                        />
                        <img
                          className="absolute w-2 h-2 top-[70px] left-[348px]"
                          alt="Resizer"
                          src="/resizer.svg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
  
            <div className="inline-flex items-center gap-4 absolute top-[838px] left-[757px]">
              <Button
                variant="outline"
                className="flex w-[200px] items-center justify-center px-4 py-2.5 relative rounded-[20px] border-2 border-solid border-[#e4e2dd] h-auto"
              >
                <div className="flex w-[82px] items-center gap-1 relative">
                  <ChevronLeftIcon className="relative w-5 h-5" />
                  <div className="inline-flex h-5 items-center gap-2.5 px-0 py-0.5 relative flex-[0_0_auto]">
                    <div className="relative w-fit font-btn-14px-medium font-[number:var(--btn-14px-medium-font-weight)] text-on-surface-primary text-[length:var(--btn-14px-medium-font-size)] text-center tracking-[var(--btn-14px-medium-letter-spacing)] leading-[var(--btn-14px-medium-line-height)] whitespace-nowrap [font-style:var(--btn-14px-medium-font-style)]">
                      Previous
                    </div>
                  </div>
                </div>
              </Button>
  
              <Button className="flex w-[200px] h-10 items-center justify-center gap-1 pl-4 pr-3.5 py-2.5 relative bg-secondary-dark rounded-[20px] h-auto">
                <div className="inline-flex items-center gap-2.5 p-0.5 relative flex-[0_0_auto]">
                  <div className="relative w-fit mt-[-1.00px] font-btn-14px-medium font-[number:var(--btn-14px-medium-font-weight)] text-surface-default text-[length:var(--btn-14px-medium-font-size)] text-center tracking-[var(--btn-14px-medium-letter-spacing)] leading-[var(--btn-14px-medium-line-height)] whitespace-nowrap [font-style:var(--btn-14px-medium-font-style)]">
                    Next
                  </div>
                </div>
                <ChevronRightIcon className="relative w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  