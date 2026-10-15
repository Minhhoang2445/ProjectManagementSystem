{{- define "pms.labels" -}}
app.kubernetes.io/name: {{ include "pms.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "pms.name" -}}
{{- .Chart.Name -}}
{{- end }}
