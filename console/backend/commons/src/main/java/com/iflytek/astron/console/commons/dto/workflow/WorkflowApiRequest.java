package com.iflytek.astron.console.commons.dto.workflow;

import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.dto.chat.ChatRequestDto;
import lombok.Data;

import java.util.LinkedList;

@Data
public class WorkflowApiRequest {

    private String flow_id;

    private String uid;

    private JSONObject parameters;

    private LinkedList<ChatRequestDto> history;

    // Outer debugger field
    private boolean stream;
    private String version;

    public WorkflowApiRequest(String flowId, String uid, JSONObject input, LinkedList<ChatRequestDto> history, String version) {
        this.flow_id = flowId;
        this.uid = uid.toString();
        this.stream = true;
        this.parameters = input;
        this.history = history;
        this.version = version;
    }
}
