package com.iflytek.astron.console.commons.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserNicknameUpdatedEvent extends ApplicationEvent {

    private final String uid;
    private final String oldNickname;
    private final String newNickname;

    public UserNicknameUpdatedEvent(Object source, String uid, String oldNickname, String newNickname) {
        super(source);
        this.uid = uid;
        this.oldNickname = oldNickname;
        this.newNickname = newNickname;
    }
}