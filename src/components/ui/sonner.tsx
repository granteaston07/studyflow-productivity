import { useTheme } from "@/hooks/useTheme"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  const sonnerTheme = theme === 'system' ? 'system' : theme as 'light' | 'dark'

  return (
    <Sonner
      theme={sonnerTheme}
      position="top-center"
      offset={8}
      duration={2800}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-2xl !border !border-border/60 !shadow-lg !shadow-black/8 !bg-card !text-foreground !px-4 !py-3 !text-sm !font-medium",
          description: "!text-muted-foreground !text-xs !mt-0.5",
          success: "!border-l-2 !border-l-primary",
          error:   "!border-l-2 !border-l-error",
          warning: "!border-l-2 !border-l-warning",
          actionButton: "!bg-primary !text-primary-foreground !rounded-xl !text-xs !font-semibold",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-xl !text-xs",
          closeButton:  "!bg-muted/80 !text-muted-foreground !border-border/40",
        },
      }}
      style={{
        top: 'max(env(safe-area-inset-top), 0px)',
        marginTop: '8px',
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
